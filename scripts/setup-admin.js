const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration')
  console.log('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  console.log('🚀 Setting up admin user...')
  
  const adminEmail = 'admin@omaima.com'
  const adminPassword = 'admin123'
  
  try {
    // Create the admin user
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        role: 'ADMIN',
        first_name: 'Admin',
        last_name: 'User'
      }
    })

    if (error) {
      if (error.message.includes('already registered')) {
        console.log('📧 Admin user already exists, updating role...')
        
        // Find existing user and update their role
        const { data: users, error: listError } = await supabase.auth.admin.listUsers()
        if (listError) throw listError
        
        const existingUser = users.users.find(user => user.email === adminEmail)
        if (existingUser) {
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            {
              user_metadata: {
                role: 'ADMIN',
                first_name: 'Admin',
                last_name: 'User'
              }
            }
          )
          if (updateError) throw updateError
          console.log('✅ Admin role updated successfully!')
        }
      } else {
        throw error
      }
    } else {
      console.log('✅ Admin user created successfully!')
    }
    
    console.log('\n🎉 Admin Setup Complete!')
    console.log('═══════════════════════════════════')
    console.log(`📧 Email: ${adminEmail}`)
    console.log(`🔑 Password: ${adminPassword}`)
    console.log('🚪 Login URL: http://localhost:3000/auth/login')
    console.log('🏠 Admin Dashboard: http://localhost:3000/admin')
    console.log('═══════════════════════════════════')
    console.log('\n💡 You can now log in as admin!')
    
  } catch (error) {
    console.error('❌ Error setting up admin user:', error.message)
    process.exit(1)
  }
}

createAdminUser().then(() => {
  console.log('🗑️ Cleaning up setup file...')
  const fs = require('fs')
  const path = require('path')
  
  try {
    fs.unlinkSync(__filename)
    console.log('✅ Setup file deleted successfully!')
  } catch (error) {
    console.log('⚠️ Could not delete setup file:', error.message)
    console.log('💡 Please manually delete this file:', __filename)
  }
})
