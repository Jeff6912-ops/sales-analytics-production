const { createClient } = require('@supabase/supabase-js')

// You can either:
// 1. Set environment variables before running: SUPABASE_SERVICE_KEY=your_key npm run generate-data
// 2. Or uncomment and set these directly:
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gktdkjeflginpvgsndyy.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

// Initialize Supabase client
if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_KEY environment variable')
  console.error('   Get your service role key from: https://supabase.com/dashboard/project/gktdkjeflginpvgsndyy/settings/api')
  console.error('   Then run: SUPABASE_SERVICE_KEY=your_key npm run generate-data')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Sample data for generating realistic calls
const sampleData = {
  clients: ['KLINICS', 'REALTY', 'SAASCO'],
  
  prospects: [
    'John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson',
    'Jennifer Garcia', 'Robert Miller', 'Lisa Martinez', 'Christopher Taylor', 'Amanda Anderson',
    'Matthew Thomas', 'Jessica White', 'Daniel Jackson', 'Ashley Thompson', 'Andrew Harris',
    'Stephanie Martin', 'Joshua Rodriguez', 'Samantha Lewis', 'Kevin Lee', 'Nicole Walker',
    'Brian Hall', 'Melissa Allen', 'Ryan Young', 'Heather King', 'Justin Wright',
    'Michelle Lopez', 'Brandon Hill', 'Rachel Green', 'Tyler Adams', 'Christina Baker'
  ],

  callSources: ['ghl', 'zoom'],

  // Realistic needs based on different business types
  needs: {
    KLINICS: [
      'Medical consultation scheduling',
      'Insurance verification questions',
      'Specialist referral request',
      'Prescription renewal inquiry',
      'Lab results discussion',
      'Treatment plan consultation',
      'Emergency appointment request',
      'Follow-up appointment scheduling',
      'Second opinion consultation',
      'Preventive care scheduling'
    ],
    REALTY: [
      'Property listing inquiry',
      'Home buying consultation',
      'Market analysis request',
      'Property valuation inquiry',
      'Investment property consultation',
      'First-time buyer assistance',
      'Property showing request',
      'Mortgage pre-approval guidance',
      'Neighborhood information request',
      'Rental property inquiry'
    ],
    SAASCO: [
      'Software demo request',
      'Pricing information inquiry',
      'Implementation timeline discussion',
      'Feature comparison request',
      'Technical support consultation',
      'Integration capabilities inquiry',
      'Training program information',
      'Custom solution consultation',
      'Migration assistance request',
      'ROI analysis discussion'
    ]
  },

  objections: [
    'Price is too high',
    'Need to think about it',
    'Have to discuss with spouse/partner',
    'Budget constraints this quarter',
    'Already working with someone else',
    'Not the right time',
    'Need more information',
    'Waiting for approval',
    'Concerned about implementation time',
    'No objections noted',
    'No objections - call did not connect'
  ],

  outcomes: [
    'Appointment scheduled',
    'Follow-up call requested',
    'Information sent via email',
    'Referred to specialist',
    'Call back in 30 days',
    'Not interested at this time',
    'Wrong number',
    'Call did not connect - voicemail reached',
    'Converted to client',
    'Demo scheduled',
    'Proposal requested',
    'Consultation booked'
  ]
}

// Generate a random date within the last 30 days
function getRandomDate() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))
  const randomTime = thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime())
  return new Date(randomTime)
}

// Generate realistic HeatCheck score (weighted towards lower scores)
function getRandomHeatCheck() {
  const rand = Math.random()
  if (rand < 0.4) return 0  // 40% chance of 0
  if (rand < 0.6) return Math.floor(Math.random() * 3) + 1  // 20% chance of 1-3
  if (rand < 0.8) return Math.floor(Math.random() * 3) + 4  // 20% chance of 4-6
  if (rand < 0.95) return Math.floor(Math.random() * 2) + 7  // 15% chance of 7-8
  return Math.floor(Math.random() * 2) + 9  // 5% chance of 9-10
}

// Generate analysis text in the format the parser expects
function generateAnalysis(client, heatCheck, prospectName, need, objection, outcome) {
  // Sometimes generate simple format, sometimes detailed format
  const useSimpleFormat = Math.random() < 0.3 // 30% simple format

  if (useSimpleFormat) {
    return `${need}. Intent: ${outcome}. Sentiment: ${heatCheck >= 6 ? 'Positive' : heatCheck >= 3 ? 'Neutral' : 'Negative'}.`
  }

  // Detailed format
  return `CALL ANALYSIS REPORT

PROSPECT NAME: ${prospectName}

HEATCHECK: ${heatCheck}/10

PROSPECT'S NEEDS:
* ${need}

OBJECTIONS:
* ${objection}

OUTCOME: ${outcome}

INDUSTRY FOCUS: ${client.toLowerCase()}

CALL QUALITY: ${heatCheck >= 7 ? 'Excellent' : heatCheck >= 4 ? 'Good' : 'Needs Improvement'}
`
}

// Generate a single call record
function generateCall() {
  const client = sampleData.clients[Math.floor(Math.random() * sampleData.clients.length)]
  const prospect = sampleData.prospects[Math.floor(Math.random() * sampleData.prospects.length)]
  const heatCheck = getRandomHeatCheck()
  const need = sampleData.needs[client][Math.floor(Math.random() * sampleData.needs[client].length)]
  const objection = sampleData.objections[Math.floor(Math.random() * sampleData.objections.length)]
  const outcome = sampleData.outcomes[Math.floor(Math.random() * sampleData.outcomes.length)]
  const callSource = sampleData.callSources[Math.floor(Math.random() * sampleData.callSources.length)]
  
  return {
    client_id: client,
    contact_name: prospect,
    call_source: callSource,
    created_at: getRandomDate().toISOString(),
    analysis: generateAnalysis(client, heatCheck, prospect, need, objection, outcome),
    // Add some additional realistic fields
    contact_phone: `+1${Math.floor(Math.random() * 1000000000).toString().padStart(10, '0')}`,
    call_duration: Math.floor(Math.random() * 1800) + 120, // 2-32 minutes
    recording_url: null // Most calls won't have recordings
  }
}

// Main function to generate and insert data
async function generateDummyData(count = 100) {
  console.log(`🚀 Generating ${count} dummy call records...`)
  
  const calls = []
  for (let i = 0; i < count; i++) {
    calls.push(generateCall())
  }

  console.log('📤 Inserting data into Supabase...')
  
  // Insert in batches of 50 to avoid overwhelming the database
  const batchSize = 50
  for (let i = 0; i < calls.length; i += batchSize) {
    const batch = calls.slice(i, i + batchSize)
    
    const { data, error } = await supabase
      .from('call_messages')
      .insert(batch)
    
    if (error) {
      console.error(`❌ Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error)
      return
    }
    
    console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(calls.length/batchSize)} (${batch.length} records)`)
  }

  console.log(`🎉 Successfully generated ${count} dummy call records!`)
  
  // Show some statistics
  const clientCounts = {}
  const heatCheckCounts = {}
  
  calls.forEach(call => {
    // Count by client
    clientCounts[call.client_id] = (clientCounts[call.client_id] || 0) + 1
    
    // Count by HeatCheck score
    const heatCheck = call.analysis.match(/HEATCHECK: (\d+)/)?.[1] || 'N/A'
    heatCheckCounts[heatCheck] = (heatCheckCounts[heatCheck] || 0) + 1
  })
  
  console.log('\n📊 Data Distribution:')
  console.log('By Client:', clientCounts)
  console.log('By HeatCheck Score:', heatCheckCounts)
}

// Get count from command line argument or default to 100
const count = parseInt(process.argv[2]) || 100

console.log('🎯 Sales Call Dummy Data Generator')
console.log('==================================')
console.log(`Target: ${count} records`)
console.log(`Database: ${SUPABASE_URL}`)
console.log('')

// Run the script
generateDummyData(count).catch(console.error) 