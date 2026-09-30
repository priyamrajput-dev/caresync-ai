import {
  Region,
  Hospital,
  Resource,
  Supplier,
  SupplierResource,
  Inventory,
  Alert,
  Agent,
  AgentLog,
  RiskScore,
  User,
  Discharge,
} from '../../models/index.js';
import { vectorService } from '../ai/vector.service.js';
import { logger } from '../../utils/logger.js';

export async function seedDatabase(force = false) {
  const existingCount = await Hospital.countDocuments();
  if (existingCount > 0 && !force) {
    logger.info('Database already contains records. Skipping seed.');
    return;
  }

  logger.info('Seeding database with healthcare operational data...');

  // 1. Regions
  const regionsData = [
    { name: 'Punjab', country: 'India' },
    { name: 'Delhi NCR', country: 'India' },
    { name: 'Central Hub', country: 'India' },
    { name: 'Mumbai', country: 'India' },
    { name: 'Chennai', country: 'India' },
  ];
  const regionMap = {};
  for (const r of regionsData) {
    const reg = await Region.findOneAndUpdate({ name: r.name }, r, { upsert: true, new: true });
    regionMap[r.name] = reg;
  }

  // 2. Hospitals (Matching normalized coordinates)
  const hospitalsData = [
    {
      name: 'PGIMER Chandigarh',
      regionId: regionMap['Punjab']._id,
      regionName: 'Punjab',
      positionX: 0.15,
      positionY: 0.18,
      occupancy: 72,
      efficiency: 94,
      contactEmail: 'ops@pgimer.edu.in',
    },
    {
      name: 'AIIMS New Delhi',
      regionId: regionMap['Delhi NCR']._id,
      regionName: 'Delhi NCR',
      positionX: 0.50,
      positionY: 0.25,
      occupancy: 95,
      efficiency: 78,
      contactEmail: 'ops@aiims.edu',
    },
    {
      name: 'Central Medical Hub',
      regionId: regionMap['Central Hub']._id,
      regionName: 'Central Hub',
      positionX: 0.48,
      positionY: 0.50,
      occupancy: 68,
      efficiency: 92,
      contactEmail: 'ops@centralhub.gov.in',
    },
    {
      name: 'Tata Memorial Hospital Mumbai',
      regionId: regionMap['Mumbai']._id,
      regionName: 'Mumbai',
      positionX: 0.25,
      positionY: 0.72,
      occupancy: 81,
      efficiency: 88,
      contactEmail: 'ops@tatamemorial.gov.in',
    },
    {
      name: 'Government General Hospital Chennai',
      regionId: regionMap['Chennai']._id,
      regionName: 'Chennai',
      positionX: 0.60,
      positionY: 0.82,
      occupancy: 74,
      efficiency: 91,
      contactEmail: 'ops@gghchennai.gov.in',
    },
  ];

  const hospitalMap = {};
  for (const h of hospitalsData) {
    const hosp = await Hospital.findOneAndUpdate({ name: h.name }, h, { upsert: true, new: true });
    hospitalMap[h.name] = hosp;
  }

  // 3. Resources
  const resourcesData = [
    {
      name: 'oxygen',
      displayName: 'Medical Oxygen Cylinders',
      category: 'gas',
      unit: 'tanks',
      warningThreshold: 70.0,
      criticalThreshold: 40.0,
      description: 'High-purity liquid and gaseous medical oxygen storage',
    },
    {
      name: 'icu_beds',
      displayName: 'ICU Beds',
      category: 'bed',
      unit: 'units',
      warningThreshold: 75.0,
      criticalThreshold: 50.0,
      description: 'Intensive Care Unit telemetry bed slots with life-support',
    },
    {
      name: 'pharmaceuticals',
      displayName: 'Critical Pharmaceuticals',
      category: 'pharma',
      unit: 'units',
      warningThreshold: 70.0,
      criticalThreshold: 40.0,
      description: 'Emergency antibiotics, vasopressors, and analgesics',
    },
    {
      name: 'blood_supply',
      displayName: 'Blood Bank Units',
      category: 'blood',
      unit: 'units',
      warningThreshold: 65.0,
      criticalThreshold: 35.0,
      description: 'Cold-stored whole blood and platelets across all blood groups',
    },
    {
      name: 'ventilators',
      displayName: 'Invasive Ventilators',
      category: 'machine',
      unit: 'machines',
      warningThreshold: 70.0,
      criticalThreshold: 40.0,
      description: 'Advanced intensive care mechanical ventilation fleet',
    },
  ];

  const resourceMap = {};
  for (const r of resourcesData) {
    const res = await Resource.findOneAndUpdate({ name: r.name }, r, { upsert: true, new: true });
    resourceMap[r.name] = res;
  }

  // 4. Users (Passwords hashed via pre-save hook)
  const usersData = [
    {
      name: 'Dr. Sarah Chen',
      title: 'Chief Medical Officer',
      email: 'sarah.chen@caresync.gov.in',
      password: 'CareSync@2026',
      role: 'admin',
      hospitalId: null,
    },
    {
      name: 'Dr. Arjun Mehta',
      title: 'Procurement Officer',
      email: 'arjun.mehta@caresync.gov.in',
      password: 'CareSync@2026',
      role: 'operator',
      hospitalId: hospitalMap['AIIMS New Delhi']._id,
    },
    {
      name: 'Priya Sharma',
      title: 'Supply Chain Analyst',
      email: 'priya.sharma@caresync.gov.in',
      password: 'CareSync@2026',
      role: 'viewer',
      hospitalId: hospitalMap['Tata Memorial Hospital Mumbai']._id,
    },
  ];

  for (const u of usersData) {
    const existing = await User.findOne({ email: u.email });
    if (!existing) {
      const user = new User(u);
      await user.save();
    }
  }

  // 5. Suppliers
  const suppliersData = [
    {
      name: 'AirSupply Corp',
      reliabilityScore: 98.0,
      leadTimeDays: 2,
      contactEmail: 'supply@airsupply.com',
      country: 'India',
      logisticsRiskScore: 5.0,
    },
    {
      name: 'MedStock India Ltd',
      reliabilityScore: 87.5,
      leadTimeDays: 5,
      contactEmail: 'orders@medstock.in',
      country: 'India',
      logisticsRiskScore: 18.0,
    },
    {
      name: 'PharmaLink Global',
      reliabilityScore: 92.0,
      leadTimeDays: 3,
      contactEmail: 'procurement@pharmalink.com',
      country: 'Singapore',
      logisticsRiskScore: 12.5,
    },
  ];

  const supplierMap = {};
  for (const s of suppliersData) {
    const sup = await Supplier.findOneAndUpdate({ name: s.name }, s, { upsert: true, new: true });
    supplierMap[s.name] = sup;
  }

  // 6. Supplier Resources (Catalogs)
  const supplierCatalogs = [
    { supplier: 'AirSupply Corp', resource: 'oxygen', price: 4500, qty: 10000 },
    { supplier: 'AirSupply Corp', resource: 'ventilators', price: 285000, qty: 50 },
    { supplier: 'MedStock India Ltd', resource: 'pharmaceuticals', price: 1200, qty: 50000 },
    { supplier: 'MedStock India Ltd', resource: 'blood_supply', price: 3200, qty: 5000 },
    { supplier: 'PharmaLink Global', resource: 'pharmaceuticals', price: 1050, qty: 80000 },
    { supplier: 'PharmaLink Global', resource: 'oxygen', price: 4800, qty: 8000 },
  ];

  for (const item of supplierCatalogs) {
    const sup = supplierMap[item.supplier];
    const res = resourceMap[item.resource];
    if (sup && res) {
      await SupplierResource.findOneAndUpdate(
        { supplierId: sup._id, resourceId: res._id },
        {
          supplierId: sup._id,
          resourceId: res._id,
          resourceName: res.name,
          unitPrice: item.price,
          availableQuantity: item.qty,
        },
        { upsert: true }
      );
    }
  }

  // 7. Inventory
  const inventoriesData = [
    // PGIMER Chandigarh
    { hospital: 'PGIMER Chandigarh', resource: 'oxygen', level: 98.0, cap: 5000, status: 'stable', trend: 1 },
    { hospital: 'PGIMER Chandigarh', resource: 'icu_beds', level: 72.0, cap: 300, status: 'stable', trend: 0 },
    { hospital: 'PGIMER Chandigarh', resource: 'pharmaceuticals', level: 85.0, cap: 10000, status: 'stable', trend: 0 },
    // AIIMS New Delhi (Critical!)
    { hospital: 'AIIMS New Delhi', resource: 'oxygen', level: 24.0, cap: 8000, status: 'critical', trend: -1 },
    { hospital: 'AIIMS New Delhi', resource: 'icu_beds', level: 92.1, cap: 500, status: 'critical', trend: -1 },
    { hospital: 'AIIMS New Delhi', resource: 'pharmaceuticals', level: 61.0, cap: 20000, status: 'warning', trend: -1 },
    // Central Medical Hub
    { hospital: 'Central Medical Hub', resource: 'oxygen', level: 88.0, cap: 12000, status: 'stable', trend: 0 },
    { hospital: 'Central Medical Hub', resource: 'icu_beds', level: 68.0, cap: 800, status: 'warning', trend: -1 },
    { hospital: 'Central Medical Hub', resource: 'pharmaceuticals', level: 84.5, cap: 30000, status: 'stable', trend: 0 },
    // Tata Memorial Mumbai
    { hospital: 'Tata Memorial Hospital Mumbai', resource: 'oxygen', level: 65.0, cap: 6000, status: 'warning', trend: -1 },
    { hospital: 'Tata Memorial Hospital Mumbai', resource: 'icu_beds', level: 81.0, cap: 450, status: 'stable', trend: 1 },
    { hospital: 'Tata Memorial Hospital Mumbai', resource: 'pharmaceuticals', level: 78.2, cap: 25000, status: 'warning', trend: -1 },
    // Government General Hospital Chennai
    { hospital: 'Government General Hospital Chennai', resource: 'oxygen', level: 91.0, cap: 7000, status: 'stable', trend: 0 },
    { hospital: 'Government General Hospital Chennai', resource: 'icu_beds', level: 74.5, cap: 400, status: 'stable', trend: 0 },
    { hospital: 'Government General Hospital Chennai', resource: 'pharmaceuticals', level: 88.0, cap: 18000, status: 'stable', trend: 1 },
  ];

  for (const inv of inventoriesData) {
    const hosp = hospitalMap[inv.hospital];
    const res = resourceMap[inv.resource];
    if (hosp && res) {
      await Inventory.findOneAndUpdate(
        { hospitalId: hosp._id, resourceId: res._id },
        {
          hospitalId: hosp._id,
          resourceId: res._id,
          resourceName: res.name,
          currentLevel: inv.level,
          capacityTotal: inv.cap,
          status: inv.status,
          trend: inv.trend,
          lastUpdatedAt: new Date(),
        },
        { upsert: true }
      );
    }
  }

  // 8. Alerts
  const alertsData = [
    {
      hospital: 'AIIMS New Delhi',
      resource: 'oxygen',
      alertType: 'shortage',
      severity: 'critical',
      message: 'Oxygen supply at AIIMS New Delhi has dropped to 24% — immediate procurement required.',
      status: 'open',
    },
    {
      hospital: 'AIIMS New Delhi',
      resource: 'icu_beds',
      alertType: 'threshold',
      severity: 'high',
      message: 'ICU occupancy at AIIMS New Delhi has exceeded 90% — surge capacity protocols advised.',
      status: 'open',
    },
    {
      hospital: 'Tata Memorial Hospital Mumbai',
      resource: 'pharmaceuticals',
      alertType: 'shortage',
      severity: 'moderate',
      message: 'Critical oncology pharmaceuticals inventory trending downwards in Mumbai facility.',
      status: 'acknowledged',
    },
  ];

  for (const a of alertsData) {
    const hosp = hospitalMap[a.hospital];
    const res = resourceMap[a.resource];
    if (hosp) {
      await Alert.findOneAndUpdate(
        { hospitalId: hosp._id, message: a.message },
        {
          hospitalId: hosp._id,
          hospitalName: hosp.name,
          resourceId: res?._id || null,
          resourceName: res?.name || null,
          alertType: a.alertType,
          severity: a.severity,
          message: a.message,
          status: a.status,
        },
        { upsert: true }
      );
    }
  }

  // 9. Agents
  const agentsData = [
    { name: 'Supply Intelligence Agent', agentType: 'supply_intelligence', status: 'active' },
    { name: 'Procurement Agent', agentType: 'procurement', status: 'active' },
    { name: 'Risk Analysis Agent', agentType: 'risk_analysis', status: 'active' },
    { name: 'Emergency Monitoring Agent', agentType: 'emergency_monitoring', status: 'active' },
    { name: 'Operations Agent', agentType: 'operations', status: 'active' },
    { name: 'Executive Reporting Agent', agentType: 'executive_reporting', status: 'active' },
  ];
  const agentMap = {};
  for (const ag of agentsData) {
    const a = await Agent.findOneAndUpdate({ agentType: ag.agentType }, ag, { upsert: true, new: true });
    agentMap[ag.agentType] = a;
  }

  // 10. Initial Agent Logs
  const agentLogsData = [
    {
      agentType: 'supply_intelligence',
      hospital: 'AIIMS New Delhi',
      severity: 'critical',
      message: 'Oxygen inventory at AIIMS New Delhi verified — level: 24%. Triggering procurement recommendation.',
      metadata: { resource: 'oxygen', level: 24.0 },
    },
    {
      agentType: 'procurement',
      hospital: 'AIIMS New Delhi',
      severity: 'warning',
      message: 'Supplier quote evaluated for AirSupply Corp: reliability 98%, lead time 2 days. Ready for approval.',
      metadata: { supplier: 'AirSupply Corp', reliability: 98.0, resource: 'oxygen' },
    },
    {
      agentType: 'risk_analysis',
      hospital: 'AIIMS New Delhi',
      severity: 'warning',
      message: 'National operational risk score updated — Delhi NCR flagged as critical (78/100).',
      metadata: { risk_score: 78, region: 'Delhi NCR' },
    },
    {
      agentType: 'emergency_monitoring',
      hospital: null,
      severity: 'info',
      message: 'Seasonal respiratory surge monitored across Northern India corridor.',
      metadata: { surge_level: 'moderate' },
    },
  ];

  for (const l of agentLogsData) {
    const ag = agentMap[l.agentType];
    const hosp = l.hospital ? hospitalMap[l.hospital] : null;
    if (ag) {
      await AgentLog.create({
        agentId: ag._id,
        agentName: ag.name,
        agentType: ag.agentType,
        hospitalId: hosp?._id || null,
        hospitalName: hosp?.name || null,
        severity: l.severity,
        message: l.message,
        metadata: l.metadata,
      });
    }
  }

  // 11. Risk Scores
  const riskScoresData = [
    { hospital: 'PGIMER Chandigarh', score: 12.0, level: 'low' },
    { hospital: 'AIIMS New Delhi', score: 78.0, level: 'high' },
    { hospital: 'Central Medical Hub', score: 32.0, level: 'moderate' },
    { hospital: 'Tata Memorial Hospital Mumbai', score: 45.0, level: 'moderate' },
    { hospital: 'Government General Hospital Chennai', score: 15.0, level: 'low' },
  ];

  for (const rs of riskScoresData) {
    const hosp = hospitalMap[rs.hospital];
    if (hosp) {
      await RiskScore.findOneAndUpdate(
        { hospitalId: hosp._id },
        {
          hospitalId: hosp._id,
          hospitalName: hosp.name,
          score: rs.score,
          riskLevel: rs.level,
          calculatedAt: new Date(),
        },
        { upsert: true }
      );
    }
  }

  // 12. Discharges
  const dischargesData = [
    {
      patientName: 'Rajesh Kumar',
      hospital: 'AIIMS New Delhi',
      diagnosis: 'Severe Pneumonia with Acute Hypoxemia',
      summary: 'Patient successfully stabilized following 5-day high-flow oxygen therapy. Vitals returned to baseline. Supplemental oxygen discontinued.',
      followUpPlan: 'Pulmonology outpatient checkup in 7 days. Inhaler regimen continuation.',
    },
    {
      patientName: 'Sunita Verma',
      hospital: 'PGIMER Chandigarh',
      diagnosis: 'Post-Operative Cardiac Bypass Recovery',
      summary: 'Surgical recovery completed without arrhythmia. Mobilizing independently. Wound healing well with zero signs of infection.',
      followUpPlan: 'Cardiology evaluation in 14 days; echocardiogram scheduled.',
    },
    {
      patientName: 'Amitabh Deshmukh',
      hospital: 'Tata Memorial Hospital Mumbai',
      diagnosis: 'Chemotherapy-Induced Neutropenia',
      summary: 'Absolute neutrophil count stabilized above 1500/mcL following G-CSF therapy. Afebrile for 72 hours.',
      followUpPlan: 'Complete blood count in 5 days before Cycle 4 initiation.',
    },
  ];

  for (const d of dischargesData) {
    const hosp = hospitalMap[d.hospital];
    if (hosp) {
      await Discharge.create({
        patientName: d.patientName,
        hospitalId: hosp._id,
        facilityName: hosp.name,
        diagnosis: d.diagnosis,
        summary: d.summary,
        followUpPlan: d.followUpPlan,
      });
    }
  }

  // 13. Knowledge Base Ingestion for MongoDB Atlas Vector Search
  const vectorDocs = [
    {
      title: 'National Clinical Protocol for Critical Oxygen Shortages',
      category: 'guideline',
      content: 'When hospital oxygen storage falls below the 40% critical threshold, facility leadership must immediately notify regional logistics commands and trigger rapid-cycle draft procurement orders. High-flow nasal cannula protocols must be reviewed for conservation efficiency, and backup cryogenic vaporizers must be inspected. Suppliers with reliability scores >= 90% and lead times <= 48 hours take priority.',
      tags: ['oxygen', 'protocol', 'shortage', 'clinical'],
    },
    {
      title: 'ICU Bed Surge Capacity & Triage Allocation Standards',
      category: 'protocol',
      content: 'ICU bed occupancy exceeding 85% constitutes operational warning status, while > 90% triggers emergency surge triage. Step-down telemetry units should be prepared for transfer of stabilized patients. Ventilator fleets must be inventoried every 6 hours with bio-engineering validation.',
      tags: ['icu_beds', 'surge', 'capacity', 'triage'],
    },
    {
      title: 'AirSupply Corp Supplier Reliability & Delivery Protocol',
      category: 'supplier_intel',
      content: 'AirSupply Corp maintains primary cryogenic oxygen depots in Delhi NCR and Punjab with guaranteed 48-hour delivery SLA and an audited 98% reliability score. Average unit price for 7000L cryogenic liquid equivalent is INR 4,500. Logistics risk is scored at 5% during clear weather conditions.',
      tags: ['supplier', 'airsupply', 'oxygen', 'pricing'],
    },
    {
      title: 'Essential Pharmaceuticals Supply Chain Integrity Guidelines',
      category: 'guideline',
      content: 'Pharmaceutical inventories must maintain a 30-day baseline buffer for emergency vasopressors, broad-spectrum antibiotics, and anesthetics. Cold-chain storage between 2-8 degrees Celsius must be monitored via automated continuous temperature loggers.',
      tags: ['pharma', 'cold_chain', 'storage'],
    },
  ];

  for (const vDoc of vectorDocs) {
    await vectorService.ingestDocument(vDoc);
  }

  logger.info('Database seeding completed successfully.');
}

