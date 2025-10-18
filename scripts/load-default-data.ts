import { parseDefaultData } from '../src/lib/dataParser';
import { databaseSync } from '../src/lib/dbSync';
import defaultDataJson from '../src/default-data-new.json';

async function loadDefaultData() {
  try {
    console.log('Parsing default data...');
    const defaultData = parseDefaultData(defaultDataJson);
    
    console.log('Data parsed:', {
      itemCount: defaultData.items?.length || 0,
      categoryCount: defaultData.categories?.length || 0,
      supplierCount: defaultData.suppliers?.length || 0
    });
    
    console.log('Syncing with database...');
    
    // Sync categories first
    console.log('Syncing categories...');
    await databaseSync.syncCategories(defaultData.categories);
    
    // Then suppliers
    console.log('Syncing suppliers...');
    await databaseSync.syncSuppliers(defaultData.suppliers);
    
    // Then items (which depend on categories and suppliers)
    console.log('Syncing items...');
    await databaseSync.syncItems(defaultData.items);
    
    // Finally settings
    console.log('Syncing settings...');
    await databaseSync.syncSettings(defaultData.settings || { posMode: true, autosave: true });
    
    console.log('Default data successfully loaded into database!');
  } catch (error) {
    console.error('Failed to load default data:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

loadDefaultData();