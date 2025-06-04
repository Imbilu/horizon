import BankCard from "@/components/BankCard";
import HeaderBox from "@/components/HeaderBox";
import { getAccounts } from "@/lib/actions/bank.actions"; // Ensure this import is correct
import { getLoggedInUser } from "@/lib/actions/user.actions";
import React from "react";

async function MyBanks() {
    const loggedIn = await getLoggedInUser();
    const accounts = await getAccounts({ userId: loggedIn?.userId });

    // Check for errors from the getAccounts action
    if (accounts && "error" in accounts) {
        return (
            <section className="flex">
                <div className="my-banks">
                    <HeaderBox
                        title="My Bank Accounts"
                        subtext="Effortlessly manage your banking activities"
                    />
                    <p className="text-red-500">{accounts.error}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="flex">
            <div className="my-banks">
                <HeaderBox
                    title="My Bank Accounts"
                    subtext="Effortlessly manage your banking activities"
                />
            </div>
            <div className="space-y-4">
                <h2 className="header-2">Your Cards</h2>
                <div className="flex flex-wrap gap-6">
                    {accounts &&
                        accounts.data.map((a: Account) => (
                            <BankCard
                                key={a.id}
                                account={a}
                                userName={loggedIn?.firstName}
                            />
                        ))}
                    {!accounts?.data && <p>No bank accounts added yet.</p>}
                </div>
            </div>
        </section>
    );
}

export default MyBanks;
