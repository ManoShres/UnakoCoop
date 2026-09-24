export interface Beneficiary {
  id: string;
  name: string;
  no: string;
  phone: string;
  loc: string;
  grade: string;
  job: string;
  group: string;
  lastDate: string;
  branch: string;
}

export interface VerifiedMember {
  name: string;
  grade: string;
  job: string;
  loc: string;
}

export interface PaymentRecord {
  id: string;
  date: string;
  time: string;
  counterparty: string;
  sub: string;
  channel: 'Member Transfer' | 'Merchant QR' | 'Deposit Inward' | 'Share Allocation';
  account: string;
  amount: string;
  isCredit: boolean;
  status: 'Instant Cleared' | 'Settled' | 'Credited' | 'Allocated';
  ref: string;
}

export const BENEFICIARIES: Beneficiary[] = [
  { id: 'BT', name: 'Bhojraj Tharu', no: 'UKO-2072-04192', phone: '9898****', loc: 'Chainpur, Gadhwa-5', grade: 'A', job: 'Dairy Producer', group: 'Chauri Dairy #2', lastDate: 'Yesterday 5:15 AM', branch: 'Gadhwa' },
  { id: 'SS', name: 'Sita Devi Sharma', no: 'UKO-2076-03215', phone: '9841****', loc: 'Lamahi-3, Dang', grade: 'A', job: 'Micro-Retailer', group: 'Lamahi Bazaar #1', lastDate: '3 days ago', branch: 'Lamahi' },
  { id: 'RC', name: 'Ram Bahadur Chaudhary', no: 'UKO-2071-02381', phone: '9857****', loc: 'Chainpur, Gadhwa-3', grade: 'A+', job: 'Poultry Farm', group: 'Pragati Krishak', lastDate: '1 week ago', branch: 'Gadhwa' },
];

export const RECENT_PAYMENTS: PaymentRecord[] = [
  { id: 'TXN-8801', date: '2081-11-14', time: '10:42 AM', counterparty: 'Bhojraj Tharu (UKO-2072-04192)', sub: 'Organic Mustard Seeds Procurement - Chainpur Farm Hub', channel: 'Member Transfer', account: 'Regular Savings (104-0029-64)', amount: '10,000.00', isCredit: false, status: 'Instant Cleared', ref: 'CBS-TXN-90214' },
  { id: 'TXN-8802', date: '2081-11-12', time: '03:15 PM', counterparty: 'Gadhwa Krishi & Vet Suppliers', sub: 'Veterinary Medicines & Dairy Mineral Mix - NepalPay QR', channel: 'Merchant QR', account: 'Regular Savings (104-0029-64)', amount: '3,450.00', isCredit: false, status: 'Settled', ref: 'NP-QR-441829' },
  { id: 'TXN-8803', date: '2081-11-09', time: '09:30 AM', counterparty: 'eSewa Direct Wallet Inward', sub: 'Digital Deposit to Regular Savings - Gateway Ref S4487611', channel: 'Deposit Inward', account: 'Regular Savings (104-0029-64)', amount: '25,000.00', isCredit: true, status: 'Credited', ref: 'GW-ES-782190' },
  { id: 'TXN-8804', date: '2081-11-01', time: '11:00 AM', counterparty: 'Unako Member Share Pool', sub: 'Annual Member Capital Increment - 50 New Equity Shares Added', channel: 'Share Allocation', account: 'Share Capital (SHR-04192)', amount: '5,000.00', isCredit: false, status: 'Allocated', ref: 'CBS-SHR-10291' },
  { id: 'TXN-8805', date: '2081-10-27', time: '01:20 PM', counterparty: 'Sita Devi Sharma (UKO-2076-03215)', sub: 'Bio-Fertilizer Bulk Order - Lamahi Distribution Point', channel: 'Member Transfer', account: 'Regular Savings (104-0029-64)', amount: '15,000.00', isCredit: false, status: 'Instant Cleared', ref: 'CBS-TXN-89412' },
  { id: 'TXN-8806', date: '2081-10-20', time: '04:50 PM', counterparty: 'ConnectIPS Bank Inward', sub: 'Direct Bank-to-Passbook Topup via Agricultural Development Bank', channel: 'Deposit Inward', account: 'Regular Savings (104-0029-64)', amount: '50,000.00', isCredit: true, status: 'Credited', ref: 'CIPS-TXN-10928' },
];
