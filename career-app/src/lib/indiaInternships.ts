import { Internship } from './internships';

export const mockIndiaInternships: Omit<Internship, 'deadline'>[] = [
  // Tech
  {
    id: 'in-tech-1',
    title: 'Software Engineering Intern',
    company: 'Google India',
    type: 'Tech',
    stipend: '₹80,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.google.com/about/careers/applications/jobs/results/?q=internship&location=India'
  },
  {
    id: 'in-tech-2',
    title: 'Frontend Developer Intern',
    company: 'Flipkart',
    type: 'Tech',
    stipend: '₹50,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.flipkartcareers.com'
  },
  {
    id: 'in-tech-3',
    title: 'Data Science Intern',
    company: 'Microsoft India',
    type: 'Tech',
    stipend: '₹75,000/mo',
    duration: '6 Months',
    applyUrl: 'https://careers.microsoft.com/us/en/search-results?rt=professional&keywords=internship&country=India'
  },
  {
    id: 'in-tech-4',
    title: 'Backend Systems Intern',
    company: 'Amazon India',
    type: 'Tech',
    stipend: '₹65,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.amazon.jobs/en/search?base_query=internship&loc_query=India'
  },
  {
    id: 'in-tech-5',
    title: 'Full Stack Web Intern',
    company: 'Razorpay',
    type: 'Tech',
    stipend: '₹45,000/mo',
    duration: '6 Months',
    applyUrl: 'https://razorpay.com/jobs'
  },
  {
    id: 'in-tech-6',
    title: 'Mobile Engineer Intern',
    company: 'PhonePe',
    type: 'Tech',
    stipend: '₹40,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.phonepe.com/careers'
  },
  {
    id: 'in-tech-7',
    title: 'Machine Learning Research Intern',
    company: 'Adobe India',
    type: 'Tech',
    stipend: '₹90,000/mo',
    duration: '6 Months',
    applyUrl: 'https://www.adobe.com/careers'
  },
  {
    id: 'in-tech-8',
    title: 'DevOps & SRE Intern',
    company: 'CRED',
    type: 'Tech',
    stipend: '₹60,000/mo',
    duration: '3 Months',
    applyUrl: 'https://cred.club/careers'
  },
  {
    id: 'in-tech-9',
    title: 'Cybersecurity Intern',
    company: 'Jio Platforms',
    type: 'Tech',
    stipend: '₹35,000/mo',
    duration: '3 Months',
    applyUrl: 'https://careers.jio.com'
  },
  {
    id: 'in-tech-10',
    title: 'Cloud Infrastructure Intern',
    company: 'Freshworks',
    type: 'Tech',
    stipend: '₹40,000/mo',
    duration: '6 Months',
    applyUrl: 'https://www.freshworks.com/careers'
  },
  {
    id: 'in-tech-11',
    title: 'AI/ML Engineering Intern',
    company: 'Zomato',
    type: 'Tech',
    stipend: '₹55,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.zomato.com/careers'
  },
  {
    id: 'in-tech-12',
    title: 'Software Developer Intern',
    company: 'Swiggy',
    type: 'Tech',
    stipend: '₹50,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.swiggy.com/careers'
  },
  {
    id: 'in-tech-13',
    title: 'Security Analyst Intern',
    company: 'Infosys',
    type: 'Tech',
    stipend: '₹25,000/mo',
    duration: '4 Months',
    applyUrl: 'https://www.infosys.com/careers'
  },
  {
    id: 'in-tech-14',
    title: 'Application Engineer Intern',
    company: 'TCS',
    type: 'Tech',
    stipend: '₹20,000/mo',
    duration: '6 Months',
    applyUrl: 'https://www.tcs.com/careers'
  },
  {
    id: 'in-tech-15',
    title: 'Embedded Systems Intern',
    company: 'Ola Electric',
    type: 'Tech',
    stipend: '₹35,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.olacabs.com/careers'
  },
  {
    id: 'in-tech-16',
    title: 'Systems Research Intern',
    company: 'Intel India',
    type: 'Tech',
    stipend: '₹50,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.intel.com/careers'
  },
  {
    id: 'in-tech-17',
    title: 'VLSI Engineering Intern',
    company: 'NVIDIA India',
    type: 'Tech',
    stipend: '₹80,000/mo',
    duration: '6 Months',
    applyUrl: 'https://www.nvidia.com/careers'
  },
  {
    id: 'in-tech-18',
    title: 'Firmware Developer Intern',
    company: 'AMD India',
    type: 'Tech',
    stipend: '₹60,000/mo',
    duration: '4 Months',
    applyUrl: 'https://www.amd.com/careers'
  },
  {
    id: 'in-tech-19',
    title: 'QA Automation Intern',
    company: 'Zoho',
    type: 'Tech',
    stipend: '₹30,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.zoho.com/careers'
  },
  {
    id: 'in-tech-20',
    title: 'API Engineering Intern',
    company: 'Paytm',
    type: 'Tech',
    stipend: '₹40,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.paytm.com/careers'
  },
  {
    id: 'in-tech-21',
    title: 'Network Operations Intern',
    company: 'Airtel India',
    type: 'Tech',
    stipend: '₹30,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.airtel.in/careers'
  },
  {
    id: 'in-tech-22',
    title: 'Site Reliability Intern',
    company: 'Uber India',
    type: 'Tech',
    stipend: '₹75,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.uber.com/careers'
  },
  {
    id: 'in-tech-23',
    title: 'Systems Administrator Intern',
    company: 'Wipro',
    type: 'Tech',
    stipend: '₹22,000/mo',
    duration: '6 Months',
    applyUrl: 'https://www.wipro.com/careers'
  },
  {
    id: 'in-tech-24',
    title: 'Web Design & Tech Intern',
    company: 'HCLTech',
    type: 'Tech',
    stipend: '₹25,000/mo',
    duration: '4 Months',
    applyUrl: 'https://www.hcltech.com/careers'
  },
  {
    id: 'in-tech-25',
    title: 'Solution Architect Intern',
    company: 'Tech Mahindra',
    type: 'Tech',
    stipend: '₹20,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.techmahindra.com/careers'
  },

  // Finance
  {
    id: 'in-fin-1',
    title: 'Investment Banking Intern',
    company: 'Goldman Sachs Bengaluru',
    type: 'Finance',
    stipend: '₹95,000/mo',
    duration: '2 Months',
    applyUrl: 'https://www.goldmansachs.com/careers'
  },
  {
    id: 'in-fin-2',
    title: 'Financial Analyst Intern',
    company: 'J.P. Morgan India',
    type: 'Finance',
    stipend: '₹85,000/mo',
    duration: '3 Months',
    applyUrl: 'https://careers.jpmorgan.com'
  },
  {
    id: 'in-fin-3',
    title: 'Quantitative Research Intern',
    company: 'Morgan Stanley Mumbai',
    type: 'Finance',
    stipend: '₹90,000/mo',
    duration: '2 Months',
    applyUrl: 'https://www.morganstanley.com/careers'
  },
  {
    id: 'in-fin-4',
    title: 'Corporate Finance Analyst Intern',
    company: 'Citi India',
    type: 'Finance',
    stipend: '₹70,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.citigroup.com/careers'
  },
  {
    id: 'in-fin-5',
    title: 'Treasury Markets Analyst Intern',
    company: 'Deutsche Bank India',
    type: 'Finance',
    stipend: '₹80,000/mo',
    duration: '3 Months',
    applyUrl: 'https://careers.db.com'
  },
  {
    id: 'in-fin-6',
    title: 'Commercial Banking Intern',
    company: 'HSBC India',
    type: 'Finance',
    stipend: '₹60,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.hsbc.com/careers'
  },
  {
    id: 'in-fin-7',
    title: 'Risk Management Intern',
    company: 'Standard Chartered India',
    type: 'Finance',
    stipend: '₹55,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.sc.com/careers'
  },
  {
    id: 'in-fin-8',
    title: 'Finance Operations Intern',
    company: 'Flipkart Finance',
    type: 'Finance',
    stipend: '₹40,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.flipkartcareers.com'
  },
  {
    id: 'in-fin-9',
    title: 'Internal Audit Intern',
    company: 'ICICI Bank',
    type: 'Finance',
    stipend: '₹30,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.icicicareers.com'
  },
  {
    id: 'in-fin-10',
    title: 'Wealth Management Intern',
    company: 'HDFC Bank',
    type: 'Finance',
    stipend: '₹35,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.hdfcbank.com/careers'
  },
  {
    id: 'in-fin-11',
    title: 'Equity Research Analyst Intern',
    company: 'Axis Bank',
    type: 'Finance',
    stipend: '₹30,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.axisbank.com/careers'
  },
  {
    id: 'in-fin-12',
    title: 'Investment Operations Intern',
    company: 'Kotak Mahindra Bank',
    type: 'Finance',
    stipend: '₹32,000/mo',
    duration: '3 Months',
    applyUrl: 'https://careers.kotak.com'
  },
  {
    id: 'in-fin-13',
    title: 'Actuarial Analyst Intern',
    company: 'SBI Life Insurance',
    type: 'Finance',
    stipend: '₹28,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.sbi.co.in/careers'
  },
  {
    id: 'in-fin-14',
    title: 'Corporate Treasury Intern',
    company: 'Bajaj Finserv',
    type: 'Finance',
    stipend: '₹30,000/mo',
    duration: '4 Months',
    applyUrl: 'https://www.bajajfinserv.in/careers'
  },
  {
    id: 'in-fin-15',
    title: 'Investment Advisory Intern',
    company: 'Paytm Money',
    type: 'Finance',
    stipend: '₹25,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.paytmmoney.com/careers'
  },
  {
    id: 'in-fin-16',
    title: 'Stock Markets Analytics Intern',
    company: 'Zerodha',
    type: 'Finance',
    stipend: '₹50,000/mo',
    duration: '3 Months',
    applyUrl: 'https://zerodha.com/careers'
  },
  {
    id: 'in-fin-17',
    title: 'Quantitative Finance Intern',
    company: 'Groww',
    type: 'Finance',
    stipend: '₹45,000/mo',
    duration: '6 Months',
    applyUrl: 'https://groww.in/careers'
  },
  {
    id: 'in-fin-18',
    title: 'Data Analyst Intern',
    company: 'Angel One',
    type: 'Finance',
    stipend: '₹30,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.angelone.in/careers'
  },
  {
    id: 'in-fin-19',
    title: 'Product Finance Intern',
    company: 'Upstox',
    type: 'Finance',
    stipend: '₹35,000/mo',
    duration: '3 Months',
    applyUrl: 'https://upstox.com/careers'
  },
  {
    id: 'in-fin-20',
    title: 'Portfolio Management Intern',
    company: 'Motilal Oswal',
    type: 'Finance',
    stipend: '₹25,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.motilaloswal.com/careers'
  },
  {
    id: 'in-fin-21',
    title: 'Risk Analyst Intern',
    company: 'HDFC Securities',
    type: 'Finance',
    stipend: '₹24,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.hdfcsec.com/careers'
  },
  {
    id: 'in-fin-22',
    title: 'Tax Advisory Intern',
    company: 'PwC India',
    type: 'Finance',
    stipend: '₹25,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.pwc.in/careers'
  },
  {
    id: 'in-fin-23',
    title: 'Audit Intern',
    company: 'EY India',
    type: 'Finance',
    stipend: '₹25,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.ey.com/en_in/careers'
  },
  {
    id: 'in-fin-24',
    title: 'Corporate Advisory Intern',
    company: 'Deloitte India',
    type: 'Finance',
    stipend: '₹25,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.deloitte.com/in/en/careers'
  },
  {
    id: 'in-fin-25',
    title: 'Risk Consulting Intern',
    company: 'KPMG India',
    type: 'Finance',
    stipend: '₹25,000/mo',
    duration: '3 Months',
    applyUrl: 'https://kpmg.com/in/en/home/careers'
  },

  // Design
  {
    id: 'in-des-1',
    title: 'UI/UX Design Intern',
    company: 'Flipkart Design',
    type: 'Design',
    stipend: '₹45,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.flipkartcareers.com'
  },
  {
    id: 'in-des-2',
    title: 'Product Design Intern',
    company: 'Zomato',
    type: 'Design',
    stipend: '₹50,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.zomato.com/careers'
  },
  {
    id: 'in-des-3',
    title: 'Interaction Design Intern',
    company: 'Swiggy',
    type: 'Design',
    stipend: '₹45,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.swiggy.com/careers'
  },
  {
    id: 'in-des-4',
    title: 'Visual Design Intern',
    company: 'CRED Design',
    type: 'Design',
    stipend: '₹60,000/mo',
    duration: '3 Months',
    applyUrl: 'https://cred.club/careers'
  },
  {
    id: 'in-des-5',
    title: 'UI/UX Designer Intern',
    company: 'Razorpay',
    type: 'Design',
    stipend: '₹40,000/mo',
    duration: '6 Months',
    applyUrl: 'https://razorpay.com/jobs'
  },
  {
    id: 'in-des-6',
    title: 'Product Design Intern',
    company: 'PhonePe',
    type: 'Design',
    stipend: '₹40,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.phonepe.com/careers'
  },
  {
    id: 'in-des-7',
    title: 'Graphic Design Intern',
    company: 'Paytm',
    type: 'Design',
    stipend: '₹25,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.paytm.com/careers'
  },
  {
    id: 'in-des-8',
    title: 'UI/UX Design Intern',
    company: 'Ola Electric',
    type: 'Design',
    stipend: '₹35,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.olacabs.com/careers'
  },
  {
    id: 'in-des-9',
    title: 'Creative Designer Intern',
    company: 'Zoho Design',
    type: 'Design',
    stipend: '₹30,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.zoho.com/careers'
  },
  {
    id: 'in-des-10',
    title: 'UX Researcher Intern',
    company: 'Freshworks',
    type: 'Design',
    stipend: '₹35,000/mo',
    duration: '6 Months',
    applyUrl: 'https://www.freshworks.com/careers'
  },
  {
    id: 'in-des-11',
    title: 'Digital Design Intern',
    company: 'Jio Platforms',
    type: 'Design',
    stipend: '₹25,000/mo',
    duration: '3 Months',
    applyUrl: 'https://careers.jio.com'
  },
  {
    id: 'in-des-12',
    title: 'UI/UX Designer Intern',
    company: 'Tata Elxsi',
    type: 'Design',
    stipend: '₹22,000/mo',
    duration: '6 Months',
    applyUrl: 'https://www.tataelxsi.com'
  },
  {
    id: 'in-des-13',
    title: 'UI Developer & Design Intern',
    company: 'LTI Mindtree',
    type: 'Design',
    stipend: '₹24,000/mo',
    duration: '6 Months',
    applyUrl: 'https://www.ltimindtree.com'
  },
  {
    id: 'in-des-14',
    title: 'Graphic Design Intern',
    company: 'Nykaa',
    type: 'Design',
    stipend: '₹30,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.nykaa.com'
  },
  {
    id: 'in-des-15',
    title: 'Visual Merchandise Design Intern',
    company: 'Myntra',
    type: 'Design',
    stipend: '₹32,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.myntra.com'
  },
  {
    id: 'in-des-16',
    title: 'Product Design Intern',
    company: 'Oyo Rooms',
    type: 'Design',
    stipend: '₹30,000/mo',
    duration: '3 Months',
    applyUrl: 'https://oyorooms.com'
  },
  {
    id: 'in-des-17',
    title: 'UI Designer Intern',
    company: 'Meesho',
    type: 'Design',
    stipend: '₹28,000/mo',
    duration: '3 Months',
    applyUrl: 'https://meesho.com'
  },
  {
    id: 'in-des-18',
    title: 'Graphic & Creative Intern',
    company: 'Boat Lifestyle',
    type: 'Design',
    stipend: '₹25,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.boat-lifestyle.com'
  },
  {
    id: 'in-des-19',
    title: 'Creative Brand Design Intern',
    company: 'Licious',
    type: 'Design',
    stipend: '₹25,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.licious.in'
  },
  {
    id: 'in-des-20',
    title: 'UX Design Intern',
    company: 'Zepto',
    type: 'Design',
    stipend: '₹40,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.zeptonow.com'
  },
  {
    id: 'in-des-21',
    title: 'Industrial Design Intern',
    company: 'Tata Motors',
    type: 'Design',
    stipend: '₹30,000/mo',
    duration: '6 Months',
    applyUrl: 'https://www.tatamotors.com'
  },
  {
    id: 'in-des-22',
    title: 'UI/UX Intern',
    company: 'Infosys Design',
    type: 'Design',
    stipend: '₹22,000/mo',
    duration: '4 Months',
    applyUrl: 'https://www.infosys.com/careers'
  },
  {
    id: 'in-des-23',
    title: 'Visual Design Intern',
    company: 'Cognizant',
    type: 'Design',
    stipend: '₹20,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.cognizant.com'
  },
  {
    id: 'in-des-24',
    title: 'UI/UX Design Intern',
    company: 'Capgemini',
    type: 'Design',
    stipend: '₹20,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.capgemini.com'
  },
  {
    id: 'in-des-25',
    title: 'UX Engineer Intern',
    company: 'Wipro Design',
    type: 'Design',
    stipend: '₹22,000/mo',
    duration: '6 Months',
    applyUrl: 'https://www.wipro.com/careers'
  },

  // Marketing
  {
    id: 'in-mkt-1',
    title: 'Growth Marketing Intern',
    company: 'Swiggy',
    type: 'Marketing',
    stipend: '₹40,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.swiggy.com/careers'
  },
  {
    id: 'in-mkt-2',
    title: 'Digital Marketing Intern',
    company: 'Zomato',
    type: 'Marketing',
    stipend: '₹40,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.zomato.com/careers'
  },
  {
    id: 'in-mkt-3',
    title: 'Marketing & Brand Intern',
    company: 'CRED',
    type: 'Marketing',
    stipend: '₹50,000/mo',
    duration: '3 Months',
    applyUrl: 'https://cred.club/careers'
  },
  {
    id: 'in-mkt-4',
    title: 'Marketing Operations Intern',
    company: 'Flipkart',
    type: 'Marketing',
    stipend: '₹35,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.flipkartcareers.com'
  },
  {
    id: 'in-mkt-5',
    title: 'Brand Specialist Intern',
    company: 'Nykaa',
    type: 'Marketing',
    stipend: '₹30,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.nykaa.com'
  },
  {
    id: 'in-mkt-6',
    title: 'Performance Marketing Intern',
    company: 'Myntra',
    type: 'Marketing',
    stipend: '₹32,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.myntra.com'
  },
  {
    id: 'in-mkt-7',
    title: 'Growth & Business Intern',
    company: 'Meesho',
    type: 'Marketing',
    stipend: '₹30,000/mo',
    duration: '3 Months',
    applyUrl: 'https://meesho.com'
  },
  {
    id: 'in-mkt-8',
    title: 'Digital Marketing Intern',
    company: 'Razorpay',
    type: 'Marketing',
    stipend: '₹35,000/mo',
    duration: '3 Months',
    applyUrl: 'https://razorpay.com/jobs'
  },
  {
    id: 'in-mkt-9',
    title: 'Product Marketing Intern',
    company: 'Zoho',
    type: 'Marketing',
    stipend: '₹28,000/mo',
    duration: '6 Months',
    applyUrl: 'https://www.zoho.com/careers'
  },
  {
    id: 'in-mkt-10',
    title: 'Content Marketing Intern',
    company: 'Zepto',
    type: 'Marketing',
    stipend: '₹35,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.zeptonow.com'
  },
  {
    id: 'in-mkt-11',
    title: 'Marketing Coordinator Intern',
    company: 'Boat Lifestyle',
    type: 'Marketing',
    stipend: '₹25,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.boat-lifestyle.com'
  },
  {
    id: 'in-mkt-12',
    title: 'Growth Specialist Intern',
    company: 'Blinkit',
    type: 'Marketing',
    stipend: '₹35,000/mo',
    duration: '3 Months',
    applyUrl: 'https://blinkit.com'
  },
  {
    id: 'in-mkt-13',
    title: 'Marketing Specialist Intern',
    company: 'Ola Electric',
    type: 'Marketing',
    stipend: '₹30,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.olacabs.com/careers'
  },
  {
    id: 'in-mkt-14',
    title: 'Digital Marketing Intern',
    company: 'JioCinema',
    type: 'Marketing',
    stipend: '₹28,000/mo',
    duration: '3 Months',
    applyUrl: 'https://careers.jio.com'
  },
  {
    id: 'in-mkt-15',
    title: 'Brand Specialist Intern',
    company: 'Licious',
    type: 'Marketing',
    stipend: '₹25,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.licious.in'
  },
  {
    id: 'in-mkt-16',
    title: 'Marketing Intern',
    company: 'Coca-Cola India',
    type: 'Marketing',
    stipend: '₹35,000/mo',
    duration: '3 Months',
    applyUrl: 'https://coca-colacompany.com/careers'
  },
  {
    id: 'in-mkt-17',
    title: 'Brand Marketing Intern',
    company: 'Nestle India',
    type: 'Marketing',
    stipend: '₹35,000/mo',
    duration: '3 Months',
    applyUrl: 'https://nestle.in'
  },
  {
    id: 'in-mkt-18',
    title: 'Social Media & PR Intern',
    company: 'Unilever India',
    type: 'Marketing',
    stipend: '₹40,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.hul.co.in'
  },
  {
    id: 'in-mkt-19',
    title: 'Growth Specialist Intern',
    company: 'PhonePe',
    type: 'Marketing',
    stipend: '₹38,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.phonepe.com/careers'
  },
  {
    id: 'in-mkt-20',
    title: 'Brand Management Intern',
    company: 'Marico',
    type: 'Marketing',
    stipend: '₹35,000/mo',
    duration: '3 Months',
    applyUrl: 'https://marico.com'
  },
  {
    id: 'in-mkt-21',
    title: 'Digital Marketing Analyst Intern',
    company: 'Dabur',
    type: 'Marketing',
    stipend: '₹30,000/mo',
    duration: '3 Months',
    applyUrl: 'https://dabur.com'
  },
  {
    id: 'in-mkt-22',
    title: 'Product Marketing Intern',
    company: 'Paytm',
    type: 'Marketing',
    stipend: '₹30,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.paytm.com/careers'
  },
  {
    id: 'in-mkt-23',
    title: 'Marketing Analyst Intern',
    company: 'P&G India',
    type: 'Marketing',
    stipend: '₹40,000/mo',
    duration: '3 Months',
    applyUrl: 'https://pgcareers.com'
  },
  {
    id: 'in-mkt-24',
    title: 'Digital Media Intern',
    company: 'Tata Play',
    type: 'Marketing',
    stipend: '₹25,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.tataplay.com'
  },
  {
    id: 'in-mkt-25',
    title: 'Marketing Operations Intern',
    company: 'Hindustan Unilever',
    type: 'Marketing',
    stipend: '₹40,000/mo',
    duration: '3 Months',
    applyUrl: 'https://www.hul.co.in'
  }
];
