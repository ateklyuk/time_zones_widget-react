
export const account = {
    id: APP.constant("account").id,
    subdomain: APP.constant("account").subdomain
};

export type ACCOUNT_CF_TYPE = {
    ACCOUNT_ID: number,
    ENTREE_CATALOG: number
    ENTREE_COMPANY: number
    ENTREE_CONTACTS: number
    ENTREE_CUSTOMERS: number
    ENTREE_DEALS: number
    ID: number
    TYPE_ID: number
    NAME: string
}

export type ManagerT = {
    active: boolean
	amo_profile_id: string | null
	amojo_id: string
	avatar: string
	free_user: string
	group: string
	id: string
	is_admin: string
	login: string
	option: string
	status: string
	theme: number
	title: string
}

export const ACCOUNT_CF:Record<string, ACCOUNT_CF_TYPE> = APP.constant("account").cf
export const MANAGERS:Record<number, ManagerT> = APP.constant('managers');