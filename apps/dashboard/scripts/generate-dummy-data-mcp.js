// Generate dummy data and output SQL INSERT statements
// This can be used with the Supabase MCP server to insert data directly

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

// Escape single quotes for SQL
function escapeSql(str) {
  return str.replace(/'/g, "''")
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
    contact_phone: `+1${Math.floor(Math.random() * 1000000000).toString().padStart(10, '0')}`,
    call_duration: Math.floor(Math.random() * 1800) + 120, // 2-32 minutes
    recording_url: null
  }
}

// Generate SQL INSERT statements
function generateSqlInserts(count = 100) {
  console.log(`🚀 Generating ${count} dummy call records as SQL...`)
  
  const calls = []
  for (let i = 0; i < count; i++) {
    calls.push(generateCall())
  }

  // Create batched INSERT statements (25 records per batch for readability)
  const batchSize = 25
  const sqlStatements = []
  
  for (let i = 0; i < calls.length; i += batchSize) {
    const batch = calls.slice(i, i + batchSize)
    
    let sql = `INSERT INTO call_messages (client_id, contact_name, call_source, created_at, analysis, contact_phone, call_duration, recording_url) VALUES\n`
    
    const values = batch.map(call => {
      return `('${call.client_id}', '${escapeSql(call.contact_name)}', '${call.call_source}', '${call.created_at}', '${escapeSql(call.analysis)}', '${call.contact_phone}', ${call.call_duration}, NULL)`
    })
    
    sql += values.join(',\n')
    sql += ';'
    
    sqlStatements.push(sql)
  }
  
  // Show statistics
  const clientCounts = {}
  const heatCheckCounts = {}
  
  calls.forEach(call => {
    clientCounts[call.client_id] = (clientCounts[call.client_id] || 0) + 1
    const heatCheck = call.analysis.match(/HEATCHECK: (\d+)/)?.[1] || 'N/A'
    heatCheckCounts[heatCheck] = (heatCheckCounts[heatCheck] || 0) + 1
  })
  
  console.log('\n📊 Data Distribution:')
  console.log('By Client:', clientCounts)
  console.log('By HeatCheck Score:', heatCheckCounts)
  console.log(`\n📝 Generated ${sqlStatements.length} SQL batches`)
  
  return sqlStatements
}

// Get count from command line argument or default to 100
const count = parseInt(process.argv[2]) || 100

console.log('🎯 Sales Call Dummy Data Generator (SQL Output)')
console.log('=============================================')
console.log(`Target: ${count} records`)
console.log('')

// Generate and return SQL statements
const sqlStatements = generateSqlInserts(count)

// Export for use in other scripts
module.exports = { generateSqlInserts, generateCall, sampleData } 