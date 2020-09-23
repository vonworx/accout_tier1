
export enum AddressType {

    Shipping = 'shipping',
    Billing = 'billing',
    None = '',
    All = 'all'

}

export interface IAddress {
    firstName: string;
    lastName: string;
    company: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
    countryCode: string;
    phone: string;
    isDefault: boolean;

}