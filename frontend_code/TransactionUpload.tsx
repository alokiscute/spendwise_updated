import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, UploadCloud } from "lucide-react";

interface TransactionCSV {
  sno?: string; // Serial Number (optional)
  transaction_name: string; // Transaction name/description
  transaction_amount: string; // Transaction amount
  category?: string; // Category (optional)
  date?: string; // Date (optional, will default to current date if missing)
  type?: string; // Type (income/expense) (optional, will default to expense)
  is_want?: string; // Is it a want or need (optional)
  merchant?: string; // Merchant (optional)
}

interface Transaction {
  userId: number; // This will be added from the current user
  amount: number;
  category: string;
  description: string;
  date: string; // Using ISO string for dates to avoid conversion issues
  type: string;
  isWant: boolean;
  merchant: string | null;
}

interface Props {
  onSuccess?: () => void;
}

export default function TransactionUpload({ onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parseProgress, setParseProgress] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [parsedRows, setParsedRows] = useState(0);
  const [parsedData, setParsedData] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (transactions: Transaction[]) => {
      return apiRequest("POST", "/api/transactions/batch", { transactions });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: `${parsedRows} transactions imported successfully.`,
      });
      
      setOpen(false);
      setFile(null);
      setParseProgress(0);
      setTotalRows(0);
      setParsedRows(0);
      setParsedData([]);
      
      // Invalidate all query caches to refresh data across components
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      // Invalidate transactions for current month/year
      queryClient.invalidateQueries({
        queryKey: [`/api/transactions/month/${currentMonth}/year/${currentYear}`]
      });
      
      // Invalidate AI insights and analysis
      queryClient.invalidateQueries({
        queryKey: [`/api/ai/insights/month/${currentMonth}/year/${currentYear}`]
      });
      
      queryClient.invalidateQueries({
        queryKey: [`/api/ai/spending-classification/${currentMonth}/${currentYear}`]
      });
      
      // Invalidate budget data
      queryClient.invalidateQueries({
        queryKey: ['/api/budget']
      });
      
      // Invalidate dashboard data
      queryClient.invalidateQueries({
        queryKey: ['/api/dashboard']
      });
      
      // Call the onSuccess prop if provided
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      setError(`Error importing transactions: ${error.message}`);
      toast({
        title: "Error",
        description: `Failed to import transactions: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile) {
      // Reset previous errors
      setError(null);
      
      // Validate file type
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith('.csv')) {
        setError("Please upload a CSV file.");
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleImport = () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    // Reset states
    setError(null);
    setParseProgress(0);
    setParsedRows(0);
    setParsedData([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Check if there are results
        if (results.data && Array.isArray(results.data) && results.data.length > 0) {
          setTotalRows(results.data.length);
          
          // Process each row
          const transactions: Transaction[] = [];
          
          results.data.forEach((row: any, index) => {
            const csvRow = row as Record<string, string>;
            
            // Validate required fields - transaction data could be in different formats
            // We're looking for transaction name/description and amount fields
            const transactionName = csvRow.transaction_name || csvRow.description || csvRow.name || csvRow.transaction || "";
            const transactionAmount = csvRow.transaction_amount || csvRow.amount || "";
            
            if (!transactionName || !transactionAmount) {
              setError("Some rows are missing required fields (transaction name and amount).");
              return;
            }
            
            try {
              // Convert to the correct types with defaults for optional fields
              const transaction: Transaction = {
                userId: 0, // This will be set by the server
                amount: parseFloat(transactionAmount),
                category: (csvRow.category || "Uncategorized").toLowerCase(),
                description: transactionName,
                date: csvRow.date ? new Date(csvRow.date).toISOString() : new Date().toISOString(), // Default to today if not provided
                type: csvRow.type ? csvRow.type.toLowerCase() : "expense", // Default to expense if not provided
                isWant: csvRow.is_want ? csvRow.is_want.toLowerCase() === "true" : true, // Default to want if not provided
                merchant: csvRow.merchant || null,
              };
              
              // Validate data types
              if (isNaN(transaction.amount)) {
                throw new Error(`Row ${index + 1}: Invalid transaction amount`);
              }
              
              // No need to validate date further since we're using toISOString()
              
              // Ensure type is either income or expense
              if (transaction.type !== "income" && transaction.type !== "expense") {
                transaction.type = "expense"; // Default to expense if invalid type
              }
              
              transactions.push(transaction);
              setParsedRows(index + 1);
              setParseProgress(Math.round(((index + 1) / results.data.length) * 100));
            } catch (error) {
              setError(`Error parsing row ${index + 1}: ${error instanceof Error ? error.message : String(error)}`);
              return;
            }
          });
          
          setParsedData(transactions);
          
          // No errors, proceed with import
          if (transactions.length > 0 && !error) {
            importMutation.mutate(transactions);
          }
        } else {
          setError("The CSV file is empty or has an invalid format.");
        }
      },
      error: (error) => {
        setError(`Error parsing CSV: ${error.message}`);
      },
    });
  };
  
  const handleDownloadSample = () => {
    const link = document.createElement('a');
    link.href = '/sample_transactions.csv';
    link.download = 'sample_transactions.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex gap-2 items-center">
          <UploadCloud size={16} />
          <span>Import CSV</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Transactions</DialogTitle>
          <DialogDescription>
            Upload a CSV file with your transaction data. 
            <button 
              onClick={handleDownloadSample}
              className="text-primary hover:underline ml-1"
            >
              Download sample CSV
            </button>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
          />
          
          {error && (
            <div className="text-sm text-red-500">{error}</div>
          )}
          
          {parseProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Parsing progress</span>
                <span>{parsedRows} of {totalRows} rows</span>
              </div>
              <Progress value={parseProgress} />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!file || importMutation.isPending}
          >
            {importMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              'Import Transactions'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}