import React, { useState } from 'react';
import { Box, Typography, Paper, Divider, List, ListItem, ListItemText, Button } from '@mui/material';

const loanTypes = [
  {
    key: 'home',
    name: 'Home Loan',
    eligibility: [
      'Age: 21 to 60 years (salaried), 21 to 65 years (self-employed)',
      'Stable income (minimum ₹25,000/month is typical)',
      'Good credit score (700+ preferred)',
      'Work experience: 2-3 years for salaried; 3+ years for business owners',
    ],
    procedure: [
      'Fill out the home loan application form (online or at the bank)',
      'Submit documents: ID proof, address proof, income proof, property documents',
      'Pay processing fee',
      'Bank verifies documents and evaluates the property',
      'Sanction letter is issued',
      'Sign loan agreement and get disbursement',
    ],
    policy: [
      'Loan-to-value (LTV) ratio: Up to 75–90%',
      'Prepayment/foreclosure charges: Usually NIL for floating rate',
      'Tenure: Up to 30 years',
      'Insurance of the property might be mandatory',
    ],
  },
  {
    key: 'vehicle',
    name: 'Vehicle Loan (Car/Bike)',
    eligibility: [
      'Age: 21–65 years',
      'Minimum income: ₹15,000–25,000/month',
      'Salaried or self-employed',
      'Good credit history',
    ],
    procedure: [
      'Choose vehicle and loan amount',
      'Submit KYC, income proof, and quotation from dealer',
      'Bank evaluates your profile and vehicle',
      'Loan sanctioned and amount disbursed directly to dealer',
    ],
    policy: [
      'LTV: Up to 90–100% for new vehicles, 70–80% for used vehicles',
      'Tenure: 1 to 7 years',
      'Vehicle hypothecated to bank until repayment',
      'Insurance of vehicle mandatory',
    ],
  },
  {
    key: 'education',
    name: 'Education Loan',
    eligibility: [
      'Indian national',
      'Admission to recognized institution (India or abroad)',
      'Co-applicant (usually parent/guardian) with stable income',
      'Good academic background',
    ],
    procedure: [
      'Get admission letter from college',
      'Apply online/offline with details of course, cost, etc.',
      'Submit KYC, admission proof, fee structure, co-applicant income proof',
      'Bank verifies and approves loan',
      'Disbursement happens as per semester/year',
    ],
    policy: [
      'Moratorium: Course period + 6–12 months',
      'Tenure: Up to 15 years',
      'No collateral needed for loans up to ₹7.5 lakh',
      'Interest subsidy available under government schemes (CSIS)',
    ],
  },
  {
    key: 'personal',
    name: 'Personal Loan',
    eligibility: [
      'Age: 21–60 years',
      'Salaried/self-employed with income proof',
      'Minimum salary: ₹20,000–25,000/month (varies)',
      'Good credit score (700+ preferred)',
    ],
    procedure: [
      'Fill out application online or at bank',
      'Submit KYC and income documents',
      'Quick verification (often instant for pre-approved customers)',
      'Loan disbursed within 1–2 days',
    ],
    policy: [
      'No collateral needed',
      'Tenure: 1–5 years',
      'Higher interest rates (10%–24%)',
      'Processing and prepayment charges may apply',
    ],
  },
  {
    key: 'business',
    name: 'Business Loan',
    eligibility: [
      'Business vintage: Minimum 2–3 years',
      'Age: 21–65 years',
      'Minimum turnover: Depends on bank (often ₹10–50 lakh/year)',
      'Good repayment history',
    ],
    procedure: [
      'Submit loan application with business documents',
      'Provide PAN, GST, ITRs, bank statements, and proof of business registration',
      'Bank reviews cash flow, profitability, credit score',
      'Sanction and disbursement',
    ],
    policy: [
      'May require collateral or be unsecured',
      'Interest: 11%–22%',
      'Tenure: 1–5 years',
      'Can be working capital or term loan',
    ],
  },
  {
    key: 'agriculture',
    name: 'Agricultural Loan',
    eligibility: [
      'Farmers with land ownership',
      'Valid KYC and land records',
      'Purpose: crop production, equipment, irrigation, etc.',
    ],
    procedure: [
      'Approach bank with land documents and farming plan',
      'Bank officer verifies the land and crop plan',
      'Sanction based on land size, type of crop',
      'Loan credited to farmer’s account',
    ],
    policy: [
      'Subsidy schemes under Kisan Credit Card (KCC)',
      'Interest subsidy up to 3% (Govt. of India)',
      'Tenure: Short term (crop loans) to 7+ years (equipment loans)',
    ],
  },
  {
    key: 'lap',
    name: 'Loan Against Property (LAP)',
    eligibility: [
      'Own property (residential/commercial)',
      'Regular source of income',
      'Clear property title',
    ],
    procedure: [
      'Submit application with property and income documents',
      'Bank evaluates property’s market value',
      'Loan sanctioned up to 60–70% of value',
      'Agreement signed; loan disbursed',
    ],
    policy: [
      'Tenure: Up to 15 years',
      'Interest lower than personal loan',
      'Property remains mortgaged until repayment',
    ],
  },
];

export default function LoanInfo() {
  const [selected, setSelected] = useState('education');
  const loan = loanTypes.find(l => l.key === selected);

  return (
    <Box sx={{ p: 3, maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Loan Information</Typography>
      <Divider sx={{ mb: 3 }} />
      <Box sx={{ display: 'flex', gap: 2 }}>
        <List sx={{ minWidth: 220 }}>
          {loanTypes.map(l => (
            <ListItem button selected={selected === l.key} key={l.key} onClick={() => setSelected(l.key)}>
              <ListItemText primary={l.name} />
            </ListItem>
          ))}
        </List>
        <Paper elevation={4} sx={{ p: 3, flex: 1, borderRadius: 4 }}>
          <Typography variant="h5" fontWeight={600} color="primary" gutterBottom>{loan?.name}</Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle1" fontWeight={600}>Eligibility Criteria:</Typography>
          <List dense>
            {loan?.eligibility.map((item, i) => <ListItem key={i}><ListItemText primary={item} /></ListItem>)}
          </List>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2 }}>Application Procedure:</Typography>
          <List dense>
            {loan?.procedure.map((item, i) => <ListItem key={i}><ListItemText primary={item} /></ListItem>)}
          </List>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2 }}>Key Policies:</Typography>
          <List dense>
            {loan?.policy.map((item, i) => <ListItem key={i}><ListItemText primary={item} /></ListItem>)}
          </List>
          {selected === 'education' && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" color="primary" href="https://www.vidyalakshmi.co.in/Students/" target="_blank" rel="noopener" sx={{ fontWeight: 600 }}>
                APPLY
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
