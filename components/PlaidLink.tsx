import React, { useCallback, useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
    PlaidLinkOnSuccess,
    PlaidLinkOptions,
    usePlaidLink,
} from "react-plaid-link";
import { useRouter } from "next/navigation";
import {
    createLinkToken,
    exchangePublicToken,
} from "@/lib/actions/user.actions";
import Image from "next/image";

function PlaidLink({ user, variant }: PlaidLinkProps) {
    const router = useRouter();
    const [token, setToken] = useState("");

    useEffect(() => {
        const getLinkToken = async () => {
            const data = await createLinkToken(user);
            setToken(data?.linkToken);
        };
        getLinkToken();
    }, [user]);

    const onSuccess = useCallback<PlaidLinkOnSuccess>(
        async (public_token: string) => {
            await exchangePublicToken({ publicToken: public_token, user });
            router.push("/");
        },
        [user]
    );

    const config: PlaidLinkOptions = {
        token,
        onSuccess,
    };

    const { open, ready } = usePlaidLink(config);

    return (
        <div>
            <>
                {variant === "primary" ? (
                    <Button
                        className="plaidlink-primary"
                        onClick={() => open()}
                        disabled={!ready}
                    >
                        Connect bank
                    </Button>
                ) : variant === "ghost" ? (
                    <Button
                        onClick={() => open()}
                        className="plaidlink-ghost"
                        variant="ghost"
                    >
                        <Image
                            src="icons/connect-bank.svg"
                            alt="connect bank"
                            width={24}
                            height={24}
                        />
                        <p className="hidden font-semibold text-[16px] text-black-2 xl:block">
                            Connect Bank
                        </p>
                    </Button>
                ) : (
                    <Button
                        className="plaidlink-default"
                        onClick={() => open()}
                    >
                        <Image
                            src="icons/connect-bank.svg"
                            alt="connect bank"
                            width={24}
                            height={24}
                        />
                        <p className="font-semibold text-[16px] text-black-2">
                            Connect Bank
                        </p>
                    </Button>
                )}
            </>
        </div>
    );
}

export default PlaidLink;
