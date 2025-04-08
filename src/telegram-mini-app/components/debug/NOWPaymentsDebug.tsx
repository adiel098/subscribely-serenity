
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, AlertCircle, Info, Trash2 } from 'lucide-react';
import { logNOWPaymentsOperation } from './NOWPaymentsLogs';

export function NOWPaymentsDebug() {
  const [activeTransaction, setActiveTransaction] = useState<any>(null);
  const [storedLogs, setStoredLogs] = useState<any[]>([]);
  
  useEffect(() => {
    // קריאת עסקה אחרונה מהלוקל סטורג
    const storedTransaction = localStorage.getItem('nowpayments_transaction');
    if (storedTransaction) {
      try {
        const transaction = JSON.parse(storedTransaction);
        setActiveTransaction(transaction);
        logNOWPaymentsOperation('info', 'טעינת עסקה מאוחסנת', transaction);
      } catch (error) {
        console.error('Error parsing stored transaction:', error);
      }
    }
    
    // קריאת לוגים מהלוקל סטורג
    const storedLogsStr = localStorage.getItem('nowpayments_logs');
    if (storedLogsStr) {
      try {
        const logs = JSON.parse(storedLogsStr);
        setStoredLogs(logs || []);
      } catch (error) {
        console.error('Error parsing stored logs:', error);
      }
    }
  }, []);
  
  const clearActiveTransaction = () => {
    localStorage.removeItem('nowpayments_transaction');
    setActiveTransaction(null);
    logNOWPaymentsOperation('info', 'עסקה נוקתה ידנית', {});
  };
  
  const clearLogs = () => {
    localStorage.removeItem('nowpayments_logs');
    setStoredLogs([]);
  };
  
  const testCreateInvoice = async () => {
    try {
      logNOWPaymentsOperation('info', 'בדיקת יצירת חשבונית מבוצעת');
      
      // מקבל הגדרות מבעל הקהילה - סימולציה לצרכי בדיקה
      const communityId = 'test-community-123';
      const amount = 25;
      
      // קבלת מפתח API מהשרת
      const getNOWPaymentsConfig = async (communityId: string) => {
        // סימולציה של קבלת API key מבעל הקהילה
        return {
          api_key: 'test_api_key_123', // זה רק למטרות בדיקה
          ipn_callback_url: 'https://your-project.web.app/api/nowpayments-ipn'
        };
      };
      
      const config = await getNOWPaymentsConfig(communityId);
      logNOWPaymentsOperation('info', 'התקבלה קונפיגורציית API', {
        hasApiKey: !!config.api_key,
        hasIpnUrl: !!config.ipn_callback_url
      });
      
      // סימולציה של יצירת חשבונית
      const orderId = `${communityId}_${Date.now()}`;
      const mockResponse = {
        id: `mock-invoice-${Date.now()}`,
        invoice_url: `https://nowpayments.io/payment/?iid=mock${Date.now()}`,
        order_id: orderId,
        price_amount: amount,
        price_currency: 'usd'
      };
      
      logNOWPaymentsOperation('response', 'חשבונית לבדיקה נוצרה', mockResponse);
      
      // שמירת הנתונים בלוקל סטורג
      localStorage.setItem('nowpayments_transaction', JSON.stringify({
        invoiceId: mockResponse.id,
        orderId: mockResponse.order_id,
        amount: mockResponse.price_amount,
        timestamp: Date.now(),
        paymentUrl: mockResponse.invoice_url
      }));
      
      // עדכון המצב
      setActiveTransaction({
        invoiceId: mockResponse.id,
        orderId: mockResponse.order_id,
        amount: mockResponse.price_amount,
        timestamp: Date.now(),
        paymentUrl: mockResponse.invoice_url
      });
      
      // פתיחת חלון עם ה-URL
      window.open(mockResponse.invoice_url, '_blank');
    } catch (error) {
      console.error('Test invoice creation error:', error);
      logNOWPaymentsOperation('error', 'שגיאה בבדיקת יצירת חשבונית', { 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };
  
  return (
    <Card className="border-amber-200 bg-amber-50 mt-4">
      <CardHeader className="bg-amber-100 border-b border-amber-200 pb-2">
        <CardTitle className="text-sm font-medium text-amber-800 flex items-center">
          <Info className="h-4 w-4 mr-1" /> כלי בדיקה לתשלומי NOW Payments
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-4">
        <Tabs defaultValue="transaction">
          <TabsList className="bg-amber-100 mb-4">
            <TabsTrigger value="transaction">עסקה נוכחית</TabsTrigger>
            <TabsTrigger value="logs">לוגים</TabsTrigger>
            <TabsTrigger value="test">בדיקות</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transaction">
            {activeTransaction ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">פרטי העסקה האחרונה</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearActiveTransaction}
                    className="text-red-500 h-7"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> נקה
                  </Button>
                </div>
                
                <div className="bg-white rounded-md p-3 border border-amber-200 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">מזהה חשבונית:</span>
                    <span className="font-mono">{activeTransaction.invoiceId || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">מזהה הזמנה:</span>
                    <span className="font-mono">{activeTransaction.orderId || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">סכום:</span>
                    <span>${activeTransaction.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">נוצר:</span>
                    <span>{new Date(activeTransaction.timestamp).toLocaleString()}</span>
                  </div>
                  
                  {activeTransaction.paymentUrl && (
                    <div className="pt-2 mt-2 border-t border-amber-100">
                      <Button
                        variant="outline"
                        size="sm" 
                        className="w-full text-amber-700 border-amber-300 bg-amber-50 hover:bg-amber-100"
                        onClick={() => window.open(activeTransaction.paymentUrl, '_blank')}
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-2" />
                        פתח URL תשלום
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Alert className="bg-white border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-amber-800">
                  אין עסקה פעילה כרגע
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          <TabsContent value="logs">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">לוגים אחרונים ({storedLogs.length})</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearLogs}
                  className="text-red-500 h-7"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> נקה לוגים
                </Button>
              </div>
              
              {storedLogs.length > 0 ? (
                <div className="bg-white rounded-md border border-amber-200 text-xs max-h-80 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-amber-50 sticky top-0">
                      <tr className="border-b border-amber-200">
                        <th className="px-2 py-1 text-left">זמן</th>
                        <th className="px-2 py-1 text-left">סוג</th>
                        <th className="px-2 py-1 text-left">הודעה</th>
                      </tr>
                    </thead>
                    <tbody>
                      {storedLogs.slice().reverse().map((log, i) => (
                        <tr key={i} className="border-b border-amber-100">
                          <td className="px-2 py-1 font-mono">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="px-2 py-1">
                            <Badge variant={
                              log.type === 'error' ? 'destructive' : 
                              log.type === 'response' ? 'success' : 
                              'secondary'
                            } className="text-xs">
                              {log.type}
                            </Badge>
                          </td>
                          <td className="px-2 py-1 truncate max-w-[200px]" title={log.message}>
                            {log.message}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Alert className="bg-white border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <AlertDescription className="text-amber-800">
                    אין לוגים זמינים
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="test">
            <div className="space-y-4">
              <h3 className="font-medium">כלי בדיקה</h3>
              
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={testCreateInvoice}
                  className="bg-amber-500 text-white hover:bg-amber-600"
                >
                  בדוק יצירת חשבונית
                </Button>
                
                <p className="text-xs text-amber-700 mt-1">
                  הכפתור הזה יוצר חשבונית מזויפת למטרות בדיקה ומדמה את תהליך התשלום.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
