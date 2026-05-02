
const PROJECT = {
  title: "Secure Hybrid Network Architecture",
  subtitle: "Design and Implementation of a Secure Network Architecture for a Mid-Sized Organization",
  course: "Network Security | Final Project",
  org: "Mid-Sized Org · 100 Employees · Hybrid Cloud / On-Prem"
};

const NODES = [
  { id: 1,  name: 'Internet',                    group: 'external',    color: '#ef4444', icon: '🌐', ip: 'N/A',               description: 'Untrusted external world: end users, clients, and third-party services accessing the org from the public internet.' },
  { id: 2,  name: 'External Firewall',            group: 'security',    color: '#dc2626', icon: '🔥', ip: '203.0.113.1',       description: 'Perimeter firewall with integrated IDS/IPS. First line of defense — filters all ingress/egress traffic between the internet and internal zones.' },
  { id: 3,  name: 'DMZ (Web / Reverse Proxy)',    group: 'dmz',         color: '#f97316', icon: '🖥', ip: '10.10.1.0/24',      description: 'Demilitarized zone hosting public-facing web servers and a reverse proxy (Nginx). Exposed to the internet but isolated from internal networks.' },
  { id: 4,  name: 'Internal Firewall',            group: 'security',    color: '#dc2626', icon: '🛡', ip: '10.0.0.1',          description: 'Secondary firewall enforcing segmentation between the DMZ, VPN gateway, and internal VLANs via strict ACLs.' },
  { id: 5,  name: 'Core Switch',                  group: 'core',        color: '#3b82f6', icon: '🔀', ip: '10.0.0.2',          description: 'Layer-3 core switching fabric routing between VLANs. Trunk links carry tagged traffic to access-layer switches per zone.' },
  { id: 6,  name: 'Internal Network',             group: 'internal',    color: '#22c55e', icon: '💻', ip: '10.20.0.0/22',      description: 'Employee workstations, printers, and corporate Wi-Fi (VLAN 20). Standard user access — internet via proxy, access to approved shared services.' },
  { id: 7,  name: 'Restricted Network',           group: 'restricted',  color: '#a855f7', icon: '🔐', ip: '10.30.0.0/24',      description: 'Hosts HR systems, Finance applications, and internal databases (VLAN 30). Strict ACLs — only authorized personnel may access; all sessions logged.' },
  { id: 8,  name: 'Management Network',           group: 'management',  color: '#14b8a6', icon: '⚙️', ip: '10.40.0.0/28',      description: 'Admin-only segment (VLAN 40) for out-of-band management of firewalls, switches, and servers. MFA required; no internet access.' },
  { id: 9,  name: 'Guest Network',                group: 'guest',       color: '#eab308', icon: '👤', ip: '192.168.100.0/24',  description: 'Isolated VLAN 50 for visitors and contractors. Internet access only via captive portal; completely blocked from internal segments.' },
  { id: 10, name: 'VPN Gateway',                  group: 'security',    color: '#8b5cf6', icon: '🔒', ip: '203.0.113.5',       description: 'IPSec/SSL VPN gateway for remote employees and secure site-to-cloud tunnels. MFA enforced; certificate-based authentication.' },
  { id: 11, name: 'Cloud Provider (AWS)',          group: 'cloud',       color: '#0ea5e9', icon: '☁️', ip: 'VPC: 172.31.0.0/16', description: 'AWS cloud environment providing scalable compute (EC2), storage (S3), and managed services. Connected via VPN tunnel for hybrid workloads.' },
  { id: 12, name: 'Cloud VPC',                    group: 'cloud',       color: '#2563eb', icon: '🏗', ip: '172.31.1.0/24',     description: 'Virtual Private Cloud with public/private subnets, security groups, and Network ACLs replicating on-prem segmentation in the cloud.' },
  { id: 13, name: 'Cloud Services (App / DB)',    group: 'cloud',       color: '#16a34a', icon: '📦', ip: '172.31.2.0/24',     description: 'Web application servers (ECS/EC2) and managed RDS databases. Access restricted by security groups; data encrypted at rest and in transit.' }
];

const LINKS = [
  { source: 1,  target: 2,  label: 'Internet traffic' },
  { source: 2,  target: 3,  label: 'Firewall rules' },
  { source: 2,  target: 4,  label: 'Perimeter → Core' },
  { source: 2,  target: 10, label: 'VPN path' },
  { source: 4,  target: 5,  label: 'ACLs' },
  { source: 5,  target: 6,  label: 'VLAN 20' },
  { source: 5,  target: 7,  label: 'VLAN 30' },
  { source: 5,  target: 8,  label: 'VLAN 40' },
  { source: 5,  target: 9,  label: 'VLAN 50' },
  { source: 10, target: 11, label: 'IPSec tunnel' },
  { source: 11, target: 12, label: 'VPC config' },
  { source: 12, target: 13, label: 'Security groups' }
];

const LAYOUT = {
  // Row 1 — top (DMZ + Cloud Services)
  3:  { nx: 0.32, ny: 0.08 },
  13: { nx: 0.90, ny: 0.08 },
  // Row 2 — main traffic path
  1:  { nx: 0.04, ny: 0.40 },
  2:  { nx: 0.18, ny: 0.40 },
  4:  { nx: 0.32, ny: 0.40 },
  5:  { nx: 0.50, ny: 0.40 },
  6:  { nx: 0.68, ny: 0.20 },
  7:  { nx: 0.90, ny: 0.40 },
  // Row 3 — secondary segments
  8:  { nx: 0.68, ny: 0.60 },
  9:  { nx: 0.50, ny: 0.68 },
  10: { nx: 0.18, ny: 0.68 },
  // Row 4 — cloud
  11: { nx: 0.50, ny: 0.90 },
  12: { nx: 0.70, ny: 0.90 },
};

const SECURITY_CONTROLS = [
  {
    control: 'Perimeter Firewall',
    icon: '🔥',
    risk: 'Unauthorized external access',
    purpose: 'First line of defense; enforces allow/deny rules on all ingress and egress traffic between the internet and all internal zones. Stateful packet inspection with integrated IPS.',
    standard: 'NIST SP 800-41'
  },
  {
    control: 'IDS / IPS',
    icon: '🚨',
    risk: 'Active intrusion & exploits',
    purpose: 'Inline Intrusion Prevention System (IPS) inspects payload content. Signature-based and anomaly-based detection flags or blocks malicious traffic in real-time.',
    standard: 'ISO 27001 A.12.4'
  },
  {
    control: 'Network Segmentation (VLANs)',
    icon: '🧱',
    risk: 'Lateral movement after breach',
    purpose: 'Divides the network into isolated security zones (DMZ, Internal, Restricted, Management, Guest). Limits blast radius — a compromise in one zone cannot propagate freely.',
    standard: 'PCI-DSS 1.3'
  },
  {
    control: 'VPN Gateway (IPSec)',
    icon: '🔒',
    risk: 'Insecure remote access & data in transit',
    purpose: 'Provides encrypted tunnels for remote employees and site-to-cloud connectivity. Certificate-based authentication + MFA enforced at the gateway level.',
    standard: 'NIST SP 800-77'
  },
  {
    control: 'Access Control Lists (ACLs)',
    icon: '📋',
    risk: 'Excessive privilege / unauthorized access',
    purpose: 'Stateless packet filters on the core switch and internal firewall. Whitelist approach — only explicitly permitted traffic is allowed between zones.',
    standard: 'CIS Control 6'
  },
  {
    control: 'Multi-Factor Authentication (MFA)',
    icon: '🔑',
    risk: 'Credential theft / account takeover',
    purpose: 'TOTP or hardware token required for all admin access (Management Network), VPN connections, and cloud console access. Reduces risk from stolen passwords.',
    standard: 'NIST SP 800-63B'
  },
  {
    control: 'RBAC (Role-Based Access Control)',
    icon: '👥',
    risk: 'Insider threat / data exfiltration',
    purpose: 'Principle of least privilege applied to all systems. HR/Finance staff may only access Restricted Network resources relevant to their role. Admins have dedicated accounts.',
    standard: 'ISO 27001 A.9'
  },
  {
    control: 'Logging & SIEM',
    icon: '📊',
    risk: 'Undetected incidents / forensic blindspot',
    purpose: 'Centralized log aggregation (syslog → SIEM). Firewall, IDS, and authentication events correlated for anomaly detection. Alerts on suspicious patterns in real-time.',
    standard: 'NIST SP 800-92'
  }
];

const THREATS = [
  { threat: 'External Intrusion',     likelihood: 'High',   impact: 'Critical', control: 'Perimeter Firewall + IDS/IPS' },
  { threat: 'Phishing / Social Eng.', likelihood: 'High',   impact: 'High',     control: 'MFA + Security Awareness Training' },
  { threat: 'Lateral Movement',       likelihood: 'Medium', impact: 'Critical', control: 'VLAN Segmentation + Internal Firewall' },
  { threat: 'Data Exfiltration',      likelihood: 'Medium', impact: 'Critical', control: 'DLP + ACLs + RBAC' },
  { threat: 'Insider Threat',         likelihood: 'Low',    impact: 'High',     control: 'RBAC + SIEM Monitoring' },
  { threat: 'Ransomware',             likelihood: 'High',   impact: 'Critical', control: 'Segmentation + Backups + IPS' },
  { threat: 'Unauth. Cloud Access',   likelihood: 'Medium', impact: 'High',     control: 'VPN + MFA + Security Groups' },
  { threat: 'Guest Network Pivot',    likelihood: 'Low',    impact: 'Medium',   control: 'VLAN Isolation + Captive Portal' }
];

const IMPL_STEPS = [
  {
    phase: 'Phase 1',
    title: 'Network Zoning & IP Addressing',
    duration: 'Week 1',
    color: '#ef4444',
    tasks: [
      'Define IP address scheme for all zones (RFC 1918 internal, public range for DMZ)',
      'Assign VLAN IDs: VLAN 10 (DMZ), 20 (Internal), 30 (Restricted), 40 (Mgmt), 50 (Guest)',
      'Document subnet masks, gateway IPs, and DHCP scope per zone',
      'Configure Layer-3 core switch with inter-VLAN routing'
    ]
  },
  {
    phase: 'Phase 2',
    title: 'Firewall Rule Creation',
    duration: 'Week 2',
    color: '#f97316',
    tasks: [
      'Deploy perimeter firewall; default-deny all inbound policy',
      'Create rules: Internet → DMZ (HTTP/S 80,443 only)',
      'Create rules: DMZ → Internal Firewall (specific app ports only)',
      'Configure stateful inspection and geo-blocking for high-risk regions'
    ]
  },
  {
    phase: 'Phase 3',
    title: 'VLAN & Segmentation Setup',
    duration: 'Week 2–3',
    color: '#eab308',
    tasks: [
      'Configure trunk ports between core switch and access switches',
      'Apply ACLs: deny Restricted ↔ Internal cross-zone by default',
      'Isolate Guest VLAN — internet-only via captive portal (Cisco ISE or pfSense)',
      'Deploy Management VLAN with no internet route; OOB access only'
    ]
  },
  {
    phase: 'Phase 4',
    title: 'VPN Configuration',
    duration: 'Week 3',
    color: '#22c55e',
    tasks: [
      'Deploy VPN gateway (pfSense / FortiGate) with IPSec IKEv2',
      'Issue PKI certificates to all remote devices',
      'Configure site-to-cloud VPN tunnel (AWS Virtual Private Gateway)',
      'Enforce MFA (TOTP) for all VPN authentication attempts'
    ]
  },
  {
    phase: 'Phase 5',
    title: 'User Access Control (RBAC)',
    duration: 'Week 4',
    color: '#3b82f6',
    tasks: [
      'Integrate Active Directory / LDAP for centralized identity',
      'Define roles: Admin, HR, Finance, Standard User, Guest',
      'Apply group policies restricting resource access per role',
      'Deploy MFA (Duo / Microsoft Authenticator) for all domain accounts'
    ]
  },
  {
    phase: 'Phase 6',
    title: 'Logging & Monitoring Setup',
    duration: 'Week 4–5',
    color: '#a855f7',
    tasks: [
      'Configure syslog on all network devices → centralized SIEM (Wazuh / Splunk)',
      'Create correlation rules: port scan, brute-force, privilege escalation alerts',
      'Enable NetFlow on core switch for traffic baseline and anomaly detection',
      'Schedule weekly log review and monthly security audit'
    ]
  }
];

const ZONES = [
  { zone: 'Internet',           trust: 0,   vlan: 'N/A',    subnet: 'Public',           color: '#ef4444', description: 'Fully untrusted. All traffic treated as hostile.' },
  { zone: 'DMZ',                trust: 1,   vlan: '10',     subnet: '10.10.1.0/24',     color: '#f97316', description: 'Semi-trusted. Public-facing services only.' },
  { zone: 'Internal Network',   trust: 3,   vlan: '20',     subnet: '10.20.0.0/22',     color: '#22c55e', description: 'Trusted. Standard employee devices and services.' },
  { zone: 'Restricted Network', trust: 5,   vlan: '30',     subnet: '10.30.0.0/24',     color: '#a855f7', description: 'Highly trusted. HR, Finance, Databases.' },
  { zone: 'Management Network', trust: 5,   vlan: '40',     subnet: '10.40.0.0/28',     color: '#14b8a6', description: 'Admin-only. OOB management interfaces.' },
  { zone: 'Guest Network',      trust: 0,   vlan: '50',     subnet: '192.168.100.0/24', color: '#eab308', description: 'Untrusted. Internet-only, captive portal.' },
  { zone: 'Cloud VPC (AWS)',    trust: 4,   vlan: 'N/A',    subnet: '172.31.0.0/16',    color: '#0ea5e9', description: 'Trusted via VPN tunnel. Managed security groups.' }
];
