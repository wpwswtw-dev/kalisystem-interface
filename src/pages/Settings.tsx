// ...existing code...
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Download, Upload, Database, Link } from 'lucide-react';
import { toast } from 'sonner';
import { storage } from '@/lib/storage';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { RefreshCw } from 'lucide-react';

interface DataTypeSelection {
  items: boolean;
  categories: boolean;
  suppliers: boolean;
  tags: boolean;
  settings: boolean;
  orders: boolean;
}

export default function Settings() {
  const navigate = useNavigate();
  const { exportData, importData, loadDefaultData, manualSync, items, categories, suppliers, tags, settings, updateSettings } = useApp();
  const [importUrl, setImportUrl] = useState('');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [importMergeMode, setImportMergeMode] = useState(false);
  const [exportSelection, setExportSelection] = useState<DataTypeSelection>({
    items: true,
    categories: true,
    suppliers: true,
    tags: true,
    settings: true,
    orders: true
  });
  const [importSelection, setImportSelection] = useState<DataTypeSelection>({
    items: true,
    categories: true,
    suppliers: true,
    tags: true,
    settings: true,
    orders: true
  });

  const handleExport = () => {
    setExportDialogOpen(true);
  };

  const confirmExport = () => {
    const fullData = exportData();
    const selectedData: any = {};

    if (exportSelection.items) selectedData.items = fullData.items;
    if (exportSelection.categories) selectedData.categories = fullData.categories;
    if (exportSelection.suppliers) selectedData.suppliers = fullData.suppliers;
    if (exportSelection.tags) selectedData.tags = fullData.tags;
    if (exportSelection.settings) selectedData.settings = fullData.settings;
    if (exportSelection.orders) {
      selectedData.currentOrder = fullData.currentOrder;
      selectedData.currentOrderMetadata = fullData.currentOrderMetadata;
      selectedData.completedOrders = fullData.completedOrders;
      selectedData.pendingOrders = fullData.pendingOrders;
    }

    const blob = new Blob([JSON.stringify(selectedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tagcreator-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully!');
    setExportDialogOpen(false);
  };

  const handleImport = () => {
    setImportDialogOpen(true);
  };

  const confirmImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (importMergeMode) {
          const currentData = exportData();
          const mergedData: any = { ...currentData };

          if (importSelection.items && data.items) {
            mergedData.items = [...currentData.items, ...data.items.filter((item: any) => !currentData.items.find((i: any) => i.id === item.id))];
          }
          if (importSelection.categories && data.categories) {
            mergedData.categories = [...currentData.categories, ...data.categories.filter((cat: any) => !currentData.categories.find((c: any) => c.id === cat.id))];
          }
          if (importSelection.suppliers && data.suppliers) {
            mergedData.suppliers = [...currentData.suppliers, ...data.suppliers.filter((sup: any) => !currentData.suppliers.find((s: any) => s.id === sup.id))];
          }
          if (importSelection.tags && data.tags) {
            mergedData.tags = [...currentData.tags, ...data.tags.filter((tag: any) => !currentData.tags.find((t: any) => t.id === tag.id))];
          }
          if (importSelection.settings && data.settings) {
            mergedData.settings = { ...currentData.settings, ...data.settings };
          }
          if (importSelection.orders) {
            if (data.currentOrder) mergedData.currentOrder = data.currentOrder;
            if (data.currentOrderMetadata) mergedData.currentOrderMetadata = data.currentOrderMetadata;
            if (data.completedOrders) mergedData.completedOrders = [...currentData.completedOrders, ...data.completedOrders];
            if (data.pendingOrders) mergedData.pendingOrders = [...currentData.pendingOrders, ...data.pendingOrders];
          }

          await importData(mergedData);
        } else {
          const selectedData: any = {};
          const currentData = exportData();

          if (importSelection.items && data.items) selectedData.items = data.items;
          else selectedData.items = currentData.items;

          if (importSelection.categories && data.categories) selectedData.categories = data.categories;
          else selectedData.categories = currentData.categories;

          if (importSelection.suppliers && data.suppliers) selectedData.suppliers = data.suppliers;
          else selectedData.suppliers = currentData.suppliers;

          if (importSelection.tags && data.tags) selectedData.tags = data.tags;
          else selectedData.tags = currentData.tags;

          if (importSelection.settings && data.settings) selectedData.settings = data.settings;
          else selectedData.settings = currentData.settings;

          if (importSelection.orders) {
            if (data.currentOrder) selectedData.currentOrder = data.currentOrder;
            if (data.currentOrderMetadata) selectedData.currentOrderMetadata = data.currentOrderMetadata;
            if (data.completedOrders) selectedData.completedOrders = data.completedOrders;
            if (data.pendingOrders) selectedData.pendingOrders = data.pendingOrders;
          } else {
            selectedData.currentOrder = currentData.currentOrder;
            selectedData.currentOrderMetadata = currentData.currentOrderMetadata;
            selectedData.completedOrders = currentData.completedOrders;
            selectedData.pendingOrders = currentData.pendingOrders;
          }

          await importData(selectedData);
        }

        toast.success(`Data ${importMergeMode ? 'merged' : 'imported'} successfully!`);
        setImportDialogOpen(false);
      } catch (error) {
        toast.error('Failed to import data. Invalid file format.');
      }
    };
    input.click();
  };

  const handleResetToDefault = () => {
    if (confirm('Reset to default data? This will clear all your current data.')) {
      storage.clearAll();
      loadDefaultData();
      toast.success('Reset to default data');
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const result = await manualSync();
      if (result.success) {
        toast.success('Data synced successfully with Supabase!');
      } else {
        toast.error('Sync failed. Please try again.');
      }
    } catch (error) {
      toast.error('Sync failed. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleImportFromUrl = async () => {
    if (!importUrl.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    try {
      const response = await fetch(importUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch data from URL');
      }
      const data = await response.json();
      importData(data);
      toast.success('Data imported successfully from URL!');
      setImportUrl('');
    } catch (error) {
      toast.error('Failed to import data from URL. Check the URL and try again.');
    }
  };

  return (
    <div className="min-h-screen pb-20 px-4 pt-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full p-2 bg-accent hover:bg-accent/80 active:bg-accent/60 text-accent-foreground transition-colors"
            onClick={() => navigate(-1)}
            aria-label="Back"
            data-testid="button-back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </Button>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        <p className="text-muted-foreground">Manage your data and preferences</p>

        {/* Stats */}
        <Card className="p-4 bg-card border-border">
          <h3 className="font-semibold mb-3">Data Summary</h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{items.length}</p>
              <p className="text-xs text-muted-foreground">Items</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary">{categories.length}</p>
              <p className="text-xs text-muted-foreground">Categories</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent">{suppliers.length}</p>
              <p className="text-xs text-muted-foreground">Suppliers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-500">{tags.length}</p>
              <p className="text-xs text-muted-foreground">Tags</p>
            </div>
          </div>
        </Card>

        {/* Preferences */}
        <Card className="p-4 bg-card border-border">
          <h3 className="font-semibold mb-3">Preferences</h3>
          <div className="flex items-center gap-4">
            <label htmlFor="autosave-toggle" className="flex items-center gap-2 cursor-pointer">
              <input
                id="autosave-toggle"
                type="checkbox"
                checked={settings.autosave !== false}
                onChange={e => updateSettings({ autosave: e.target.checked })}
                className="accent-primary"
                data-testid="toggle-autosave"
              />
              <span className="font-medium">Autosave</span>
            </label>
            <span className="text-xs text-muted-foreground">Automatically save changes to database</span>
          </div>
        </Card>

        {/* Data Management */}
        <Card className="p-4 bg-card border-border">
          <h3 className="font-semibold mb-3">Data Management</h3>
          <div className="space-y-2">
            <Button
              onClick={handleExport}
              variant="outline"
              className="w-full justify-start gap-2"
              data-testid="button-export"
            >
              <Download className="w-4 h-4" />
              Export Data (JSON)
            </Button>
            <Button
              onClick={handleImport}
              variant="outline"
              className="w-full justify-start gap-2"
              data-testid="button-import"
            >
              <Upload className="w-4 h-4" />
              Import Data (JSON)
            </Button>
            <div className="space-y-2 pt-2">
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://example.com/data.json"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  className="flex-1"
                  data-testid="input-import-url"
                />
                <Button
                  onClick={handleImportFromUrl}
                  variant="outline"
                  className="gap-2"
                  data-testid="button-import-url"
                >
                  <Link className="w-4 h-4" />
                  Import from URL
                </Button>
              </div>
            </div>
            <Button
              onClick={handleResetToDefault}
              variant="outline"
              className="w-full justify-start gap-2"
              data-testid="button-reset"
            >
              <Database className="w-4 h-4" />
              Reset to Default Data
            </Button>
            <Button
              onClick={handleManualSync}
              variant="outline"
              className="w-full justify-start gap-2"
              disabled={isSyncing}
              data-testid="button-manual-sync"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Manual Sync to Supabase'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">Select the data types to export:</p>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="export-items"
                  checked={exportSelection.items}
                  onCheckedChange={(checked) => setExportSelection({ ...exportSelection, items: !!checked })}
                />
                <Label htmlFor="export-items" className="cursor-pointer">Items ({items.length})</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="export-categories"
                  checked={exportSelection.categories}
                  onCheckedChange={(checked) => setExportSelection({ ...exportSelection, categories: !!checked })}
                />
                <Label htmlFor="export-categories" className="cursor-pointer">Categories ({categories.length})</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="export-suppliers"
                  checked={exportSelection.suppliers}
                  onCheckedChange={(checked) => setExportSelection({ ...exportSelection, suppliers: !!checked })}
                />
                <Label htmlFor="export-suppliers" className="cursor-pointer">Suppliers ({suppliers.length})</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="export-tags"
                  checked={exportSelection.tags}
                  onCheckedChange={(checked) => setExportSelection({ ...exportSelection, tags: !!checked })}
                />
                <Label htmlFor="export-tags" className="cursor-pointer">Tags ({tags.length})</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="export-settings"
                  checked={exportSelection.settings}
                  onCheckedChange={(checked) => setExportSelection({ ...exportSelection, settings: !!checked })}
                />
                <Label htmlFor="export-settings" className="cursor-pointer">Settings</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="export-orders"
                  checked={exportSelection.orders}
                  onCheckedChange={(checked) => setExportSelection({ ...exportSelection, orders: !!checked })}
                />
                <Label htmlFor="export-orders" className="cursor-pointer">Orders (Current & History)</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmExport}>Export</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">Select the data types to import:</p>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="import-items"
                  checked={importSelection.items}
                  onCheckedChange={(checked) => setImportSelection({ ...importSelection, items: !!checked })}
                />
                <Label htmlFor="import-items" className="cursor-pointer">Items</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="import-categories"
                  checked={importSelection.categories}
                  onCheckedChange={(checked) => setImportSelection({ ...importSelection, categories: !!checked })}
                />
                <Label htmlFor="import-categories" className="cursor-pointer">Categories</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="import-suppliers"
                  checked={importSelection.suppliers}
                  onCheckedChange={(checked) => setImportSelection({ ...importSelection, suppliers: !!checked })}
                />
                <Label htmlFor="import-suppliers" className="cursor-pointer">Suppliers</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="import-tags"
                  checked={importSelection.tags}
                  onCheckedChange={(checked) => setImportSelection({ ...importSelection, tags: !!checked })}
                />
                <Label htmlFor="import-tags" className="cursor-pointer">Tags</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="import-settings"
                  checked={importSelection.settings}
                  onCheckedChange={(checked) => setImportSelection({ ...importSelection, settings: !!checked })}
                />
                <Label htmlFor="import-settings" className="cursor-pointer">Settings</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="import-orders"
                  checked={importSelection.orders}
                  onCheckedChange={(checked) => setImportSelection({ ...importSelection, orders: !!checked })}
                />
                <Label htmlFor="import-orders" className="cursor-pointer">Orders (Current & History)</Label>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="import-merge"
                  checked={importMergeMode}
                  onCheckedChange={(checked) => setImportMergeMode(!!checked)}
                />
                <Label htmlFor="import-merge" className="cursor-pointer">Merge with existing data (preserve current data)</Label>
              </div>
              <p className="text-xs text-muted-foreground mt-2">When enabled, new data will be added without replacing existing entries</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmImport}>Select File to Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
