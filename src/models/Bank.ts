export type BankInfo = {
    bin: number;
    logo: string;
    name: string;
    name_eng: string;
    short_name: string;
    search_key_word: string;
};

export type BankAccount = {
    id: string;
    bin: number;
    default: boolean;
    bank_number: string;
    bank_logo: string;
    holder_name: string;
    created_at: number;
    updated_at: number;
    account_id: number;
    bank_name: string;
    is_default: boolean;
};
