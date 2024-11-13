export interface KvApiResponse {
    status: string;
    message?: string;
    result?: KV[] | KV;
    error?: string;
}

interface KV {
    key: string;
    value?: string;
}
