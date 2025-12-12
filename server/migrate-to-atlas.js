import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const LOCAL_URI = 'mongodb://localhost:27017/arc14'
const ATLAS_URI = process.env.MONGODB_URI

async function migrateData() {
  try {
    console.log('🔄 Starting migration from local MongoDB to Atlas...\n')
    
    // Connect to local MongoDB
    console.log('📥 Connecting to local MongoDB...')
    const localConn = await mongoose.createConnection(LOCAL_URI).asPromise()
    console.log('✅ Connected to local MongoDB\n')
    
    // Connect to Atlas
    console.log('☁️  Connecting to MongoDB Atlas...')
    const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise()
    console.log('✅ Connected to Atlas\n')
    
    // Get all collection names from local DB
    const collections = await localConn.db.listCollections().toArray()
    console.log(`📋 Found ${collections.length} collections to migrate:\n`)
    
    for (const collInfo of collections) {
      const collectionName = collInfo.name
      console.log(`\n📦 Migrating collection: ${collectionName}`)
      
      // Get all documents from local collection
      const localCollection = localConn.db.collection(collectionName)
      const documents = await localCollection.find({}).toArray()
      
      console.log(`   Found ${documents.length} documents`)
      
      if (documents.length > 0) {
        // Insert into Atlas collection
        const atlasCollection = atlasConn.db.collection(collectionName)
        
        // Delete existing data in Atlas (optional - remove if you want to keep)
        await atlasCollection.deleteMany({})
        console.log(`   ✅ Cleared existing data in Atlas`)
        
        // Insert new data
        await atlasCollection.insertMany(documents)
        console.log(`   ✅ Inserted ${documents.length} documents to Atlas`)
      } else {
        console.log(`   ⚠️  No documents to migrate`)
      }
    }
    
    console.log('\n\n🎉 Migration completed successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    await localConn.close()
    await atlasConn.close()
    
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    process.exit(1)
  }
}

migrateData()
