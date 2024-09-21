"use server";

import { cookies } from "next/headers";
import { createAdminClient, createSessionClient } from "../server/appwrite";
import { ID } from "node-appwrite";
import { encryptId, parseStringify } from "../utils";
import {
    CountryCode,
    ProcessorTokenCreateRequest,
    ProcessorTokenCreateRequestProcessorEnum,
    Products,
} from "plaid";
import { plaidClient } from "../plaid";
import { revalidatePath } from "next/cache";
import { addFundingSource } from "./dwolla.actions";

const {
    APPWRITE_DATABASE_ID: DATABASE_ID,
    APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
    APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
} = process.env;

export const signIn = async (data) => {
    try {
        const { email, password } = data;
        const { account } = await createAdminClient();

        const response = await account.createEmailPasswordSession(
            email,
            password
        );

        return parseStringify(response);
    } catch (error) {
        console.error(error);
    }
};

export const signUp = async (data: SignUpParams) => {
    try {
        const { account } = await createAdminClient();
        const { email, password, firstName, lastName } = data;

        const newUserAccount = await account.create(
            ID.unique(),
            email,
            password,
            `${firstName} ${lastName}`
        );

        const session = await account.createEmailPasswordSession(
            email,
            password
        );

        cookies().set("appwrite-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });

        return parseStringify(newUserAccount);
    } catch (error) {
        console.error(error);
    }
};

export async function getLoggedInUser() {
    try {
        const { account } = await createSessionClient();
        const user = await account.get();
        return parseStringify(user);
    } catch (error) {
        return null;
    }
}

export const logoutAccount = async () => {
    try {
        const { account } = await createSessionClient();
        cookies().delete("appwrite-session");

        await account.deleteSession("current");
    } catch (error) {
        return null;
    }
};

export const createLinkToken = async (user: User) => {
    try {
        const tokenParams = {
            user: {
                client_user_id: user.$id,
            },
            client_name: user.name,
            products: ["auth"] as Products[],
            language: "en",
            country_codes: ["US"] as CountryCode[],
        };

        const res = await plaidClient.linkTokenCreate(tokenParams);
        return parseStringify({ linkToken: res.data.link_token });
    } catch (error) {
        console.log(error);
    }
};

export const createBankAccount = async ({
    userId,
    bankId,
    accountId,
    accessToken,
    fundingSourceUrl,
    sharableId,
}: createBankAccountProps) => {
    try {
        const { database } = await createAdminClient();

        const bankAccount = await database.createDocument(
            DATABASE_ID!,
            BANK_COLLECTION_ID!,
            ID.unique(),
            {
                userId,
                bankId,
                accountId,
                accessToken,
                fundingSourceUrl,
                sharableId,
            }
        );

        return parseStringify(bankAccount);
    } catch (error) {
        console.log(error);
    }
};

const exchangePublicToken = async ({
    publicToken,
    user,
}: exchangePublicTokenProps) => {
    try {
        const response = await plaidClient.itemPublicTokenExchange({
            public_token: publicToken,
        });

        const accessToken = response.data.access_token;
        const itemId = response.data.item_id;

        const accountResponse = await plaidClient.accountsGet({
            access_token: accessToken,
        });

        const accountData = accountResponse.data.accounts[0];

        // Create a processor token for Dwolla using the access token and account ID
        const request: ProcessorTokenCreateRequest = {
            access_token: accessToken,
            account_id: accountData.account_id,
            processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum,
        };

        const processorTokenResponse = await plaidClient.processorTokenCreate(
            request
        );
        const processorToken = processorTokenResponse.data.processor_token;

        // Create a funding source URL for the account using the Dwolla customer ID, processor token, and bank name
        const fundingSourceUrl = await addFundingSource({
            dwollaCustomerId: user.dwollaCustomerId,
            processorToken,
            bankName: accountData.name,
        });

        // If the funding source URL is not created, throw an error
        if (!fundingSourceUrl) throw Error;

        // Create a bank account using the user ID, item ID, account ID, access token, funding source URL, and sharable ID
        await createBankAccount({
            userId: user.$id,
            bankId: itemId,
            accountId: accountData.account_id,
            accessToken,
            fundingSourceUrl,
            sharableId: encryptId(accountData.account_id),
        });

        // Revalidate the path to reflect the changes
        revalidatePath("/");

        // Return a success message
        return parseStringify({
            publicTokenExchange: "complete",
        });
    } catch (error) {
        console.log(error);
    }
};
