
# Development Log

## 2025-04-07 - NOWPayments Integration Improvements

- Enhanced debug UI for the "Pay with Crypto" button
- Added detailed error reporting for NOWPayments API key issues
- Created NOWPaymentsDebugInfo component for clear configuration status indication
- Added better logging in the NOWPaymentsClient class
- Created a dedicated nowpayments-ipn edge function for handling payment notifications
- Improved error handling throughout the NOWPayments integration flow
- Made debug information visible by default in development mode

Key issue fixed: Debug UI now shows when NOWPayments API key is missing or not configured correctly.

