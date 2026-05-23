import { mockIndiaInternships } from './indiaInternships';

export interface Internship {
  id: string;
  title: string;
  company: string;
  deadline: Date | string; // Handle both Date and JSON string serialization
  type: 'Tech' | 'Finance' | 'Design' | 'Marketing';
  stipend: string;
  duration: string;
  applyUrl: string;
}

export const mockInternships: Omit<Internship, 'deadline'>[] = [
  // Tech
  {
    id: 'mock-tech-1',
    title: 'Software Engineering Intern',
    company: 'Google',
    type: 'Tech',
    stipend: '$8,000/mo',
    duration: '3 Months',
    applyUrl: 'https://careers.google.com'
  },
  {
    id: 'mock-tech-2',
    title: 'Frontend Developer Intern',
    company: 'Meta',
    type: 'Tech',
    stipend: '$9,000/mo',
    duration: '2 Months',
    applyUrl: 'https://careers.meta.com'
  },
  {
    id: 'mock-tech-3',
    title: 'Data Science Intern',
    company: 'Microsoft',
    type: 'Tech',
    stipend: '$7,500/mo',
    duration: '6 Months',
    applyUrl: 'https://careers.microsoft.com'
  },
  {
    id: 'mock-tech-4',
    title: 'Backend Systems Intern',
    company: 'Amazon',
    type: 'Tech',
    stipend: '$7,000/mo',
    duration: '3 Months',
    applyUrl: 'https://amazon.jobs'
  },
  {
    id: 'mock-tech-5',
    title: 'Machine Learning Research Intern',
    company: 'OpenAI',
    type: 'Tech',
    stipend: '$12,000/mo',
    duration: '6 Months',
    applyUrl: 'https://openai.com/careers'
  },
  {
    id: 'mock-tech-6',
    title: 'Cybersecurity Intern',
    company: 'CrowdStrike',
    type: 'Tech',
    stipend: '$6,500/mo',
    duration: '3 Months',
    applyUrl: 'https://crowdstrike.jobs'
  },
  {
    id: 'mock-tech-7',
    title: 'Full Stack Web Intern',
    company: 'Vercel',
    type: 'Tech',
    stipend: '$8,500/mo',
    duration: '3 Months',
    applyUrl: 'https://vercel.com/careers'
  },
  {
    id: 'mock-tech-8',
    title: 'Android Developer Intern',
    company: 'Samsung',
    type: 'Tech',
    stipend: '$5,500/mo',
    duration: '4 Months',
    applyUrl: 'https://samsung.com/careers'
  },
  {
    id: 'mock-tech-9',
    title: 'DevOps & Cloud Intern',
    company: 'Red Hat',
    type: 'Tech',
    stipend: '$6,000/mo',
    duration: '3 Months',
    applyUrl: 'https://redhat.com/careers'
  },
  {
    id: 'mock-tech-10',
    title: 'Data Engineer Intern',
    company: 'Snowflake',
    type: 'Tech',
    stipend: '$8,500/mo',
    duration: '6 Months',
    applyUrl: 'https://snowflake.com/careers'
  },

  // Finance
  {
    id: 'mock-fin-1',
    title: 'Investment Banking Analyst Intern',
    company: 'Goldman Sachs',
    type: 'Finance',
    stipend: '$9,500/mo',
    duration: '2 Months',
    applyUrl: 'https://goldmansachs.com/careers'
  },
  {
    id: 'mock-fin-2',
    title: 'Financial Analyst Intern',
    company: 'J.P. Morgan',
    type: 'Finance',
    stipend: '$9,000/mo',
    duration: '3 Months',
    applyUrl: 'https://jpmorganchase.com/careers'
  },
  {
    id: 'mock-fin-3',
    title: 'Quantitative Trading Intern',
    company: 'Jane Street',
    type: 'Finance',
    stipend: '$16,000/mo',
    duration: '2 Months',
    applyUrl: 'https://janestreet.com/join-us'
  },
  {
    id: 'mock-fin-4',
    title: 'Corporate Treasury Intern',
    company: 'Citi',
    type: 'Finance',
    stipend: '$7,000/mo',
    duration: '3 Months',
    applyUrl: 'https://citigroup.com/careers'
  },
  {
    id: 'mock-fin-5',
    title: 'Audit & Assurance Intern',
    company: 'Deloitte',
    type: 'Finance',
    stipend: '$5,000/mo',
    duration: '2 Months',
    applyUrl: 'https://deloitte.com/careers'
  },
  {
    id: 'mock-fin-6',
    title: 'Wealth Management Intern',
    company: 'Morgan Stanley',
    type: 'Finance',
    stipend: '$8,000/mo',
    duration: '3 Months',
    applyUrl: 'https://morganstanley.com/careers'
  },
  {
    id: 'mock-fin-7',
    title: 'Risk Analyst Intern',
    company: 'Barclays',
    type: 'Finance',
    stipend: '$7,500/mo',
    duration: '3 Months',
    applyUrl: 'https://barclays.com/careers'
  },
  {
    id: 'mock-fin-8',
    title: 'Tax Advisory Intern',
    company: 'PwC',
    type: 'Finance',
    stipend: '$4,500/mo',
    duration: '2 Months',
    applyUrl: 'https://pwc.com/careers'
  },
  {
    id: 'mock-fin-9',
    title: 'Equity Research Intern',
    company: 'Fidelity',
    type: 'Finance',
    stipend: '$6,500/mo',
    duration: '3 Months',
    applyUrl: 'https://fidelity.com/careers'
  },
  {
    id: 'mock-fin-10',
    title: 'Private Equity Intern',
    company: 'Blackstone',
    type: 'Finance',
    stipend: '$12,000/mo',
    duration: '6 Months',
    applyUrl: 'https://blackstone.com/careers'
  },

  // Design
  {
    id: 'mock-des-1',
    title: 'Product Design Intern',
    company: 'Airbnb',
    type: 'Design',
    stipend: '$8,000/mo',
    duration: '3 Months',
    applyUrl: 'https://careers.airbnb.com'
  },
  {
    id: 'mock-des-2',
    title: 'UI/UX Design Intern',
    company: 'Figma',
    type: 'Design',
    stipend: '$9,000/mo',
    duration: '3 Months',
    applyUrl: 'https://figma.com/careers'
  },
  {
    id: 'mock-des-3',
    title: 'Brand Designer Intern',
    company: 'Nike',
    type: 'Design',
    stipend: '$5,500/mo',
    duration: '4 Months',
    applyUrl: 'https://jobs.nike.com'
  },
  {
    id: 'mock-des-4',
    title: 'Graphic Design Intern',
    company: 'Adobe',
    type: 'Design',
    stipend: '$6,500/mo',
    duration: '3 Months',
    applyUrl: 'https://adobe.com/careers'
  },
  {
    id: 'mock-des-5',
    title: 'Visual Designer Intern',
    company: 'Apple',
    type: 'Design',
    stipend: '$9,500/mo',
    duration: '6 Months',
    applyUrl: 'https://apple.com/jobs'
  },
  {
    id: 'mock-des-6',
    title: 'Motion Graphics Intern',
    company: 'Netflix',
    type: 'Design',
    stipend: '$10,000/mo',
    duration: '3 Months',
    applyUrl: 'https://jobs.netflix.com'
  },
  {
    id: 'mock-des-7',
    title: 'Interaction Designer Intern',
    company: 'Uber',
    type: 'Design',
    stipend: '$7,500/mo',
    duration: '3 Months',
    applyUrl: 'https://uber.com/careers'
  },
  {
    id: 'mock-des-8',
    title: 'UX Researcher Intern',
    company: 'Spotify',
    type: 'Design',
    stipend: '$7,500/mo',
    duration: '3 Months',
    applyUrl: 'https://spotify.com/careers'
  },
  {
    id: 'mock-des-9',
    title: 'Creative Design Intern',
    company: 'Disney',
    type: 'Design',
    stipend: '$4,500/mo',
    duration: '3 Months',
    applyUrl: 'https://disneycareers.com'
  },
  {
    id: 'mock-des-10',
    title: 'Industrial Design Intern',
    company: 'Tesla',
    type: 'Design',
    stipend: '$8,500/mo',
    duration: '6 Months',
    applyUrl: 'https://tesla.com/careers'
  },

  // Marketing
  {
    id: 'mock-mkt-1',
    title: 'Digital Marketing Intern',
    company: 'HubSpot',
    type: 'Marketing',
    stipend: '$5,000/mo',
    duration: '3 Months',
    applyUrl: 'https://careers.hubspot.com'
  },
  {
    id: 'mock-mkt-2',
    title: 'Social Media Intern',
    company: 'Duolingo',
    type: 'Marketing',
    stipend: '$4,500/mo',
    duration: '3 Months',
    applyUrl: 'https://careers.duolingo.com'
  },
  {
    id: 'mock-mkt-3',
    title: 'Growth Marketing Intern',
    company: 'Stripe',
    type: 'Marketing',
    stipend: '$8,500/mo',
    duration: '3 Months',
    applyUrl: 'https://stripe.com/careers'
  },
  {
    id: 'mock-mkt-4',
    title: 'Content Creator Intern',
    company: 'TikTok',
    type: 'Marketing',
    stipend: '$5,500/mo',
    duration: '2 Months',
    applyUrl: 'https://careers.tiktok.com'
  },
  {
    id: 'mock-mkt-5',
    title: 'Brand Marketing Intern',
    company: 'Coca-Cola',
    type: 'Marketing',
    stipend: '$3,500/mo',
    duration: '3 Months',
    applyUrl: 'https://coca-colacompany.com/careers'
  },
  {
    id: 'mock-mkt-6',
    title: 'SEO Specialist Intern',
    company: 'Canva',
    type: 'Marketing',
    stipend: '$6,000/mo',
    duration: '3 Months',
    applyUrl: 'https://canva.com/careers'
  },
  {
    id: 'mock-mkt-7',
    title: 'Product Marketing Intern',
    company: 'Salesforce',
    type: 'Marketing',
    stipend: '$7,500/mo',
    duration: '4 Months',
    applyUrl: 'https://salesforce.com/careers'
  },
  {
    id: 'mock-mkt-8',
    title: 'Public Relations Intern',
    company: 'Edelman',
    type: 'Marketing',
    stipend: '$3,000/mo',
    duration: '3 Months',
    applyUrl: 'https://edelman.com/careers'
  },
  {
    id: 'mock-mkt-9',
    title: 'Marketing Operations Intern',
    company: 'Marketo',
    type: 'Marketing',
    stipend: '$4,800/mo',
    duration: '3 Months',
    applyUrl: 'https://adobe.com/careers'
  },
  {
    id: 'mock-mkt-10',
    title: 'Events & Sponsorships Intern',
    company: 'Red Bull',
    type: 'Marketing',
    stipend: '$4,200/mo',
    duration: '3 Months',
    applyUrl: 'https://redbull.com/careers'
  }
];

function getCategory(item: any): 'Tech' | 'Finance' | 'Design' | 'Marketing' {
  const cat = item.category ? String(item.category).toLowerCase() : '';
  const title = item.title ? String(item.title).toLowerCase() : '';
  
  // 1. Direct Category Maps
  if (cat.includes('quant') || cat.includes('finance') || cat.includes('trading')) {
    return 'Finance';
  }
  if (cat.includes('design') || cat.includes('ui') || cat.includes('ux') || cat.includes('graphic') || cat.includes('creative')) {
    return 'Design';
  }
  if (cat.includes('marketing') || cat.includes('growth') || cat.includes('sales') || cat.includes('social')) {
    return 'Marketing';
  }
  
  // 2. Regex word boundaries on Title
  // Design keywords
  if (/\b(design|designer|ui|ux|graphic|creative|illustrator|figma|motion)\b/i.test(title)) {
    return 'Design';
  }
  
  // Finance keywords
  if (/\b(finance|financial|investment|bank|banking|quant|quantitative|trading|trader|portfolio|accounting|audit|tax|equity|treasury)\b/i.test(title)) {
    return 'Finance';
  }
  
  // Marketing keywords
  if (/\b(marketing|growth|seo|sales|social|content|brand|branding|advertising|ads|pr|public relations)\b/i.test(title)) {
    // Exclude social worker or engineering ads
    if (!title.includes('worker') && !title.includes('engineer') && !title.includes('developer') && !title.includes('software')) {
      return 'Marketing';
    }
  }

  // 3. Fallback direct category maps for Tech
  if (cat.includes('software') || cat.includes('hardware') || cat.includes('data') || cat.includes('ai') || cat.includes('ml') || cat.includes('product') || cat.includes('cyber') || cat.includes('security')) {
    return 'Tech';
  }
  
  return 'Tech';
}

function getDeterministicValues(id: string, isIndiaMode: boolean = false): { day: number; stipend: string; duration: string } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  const day = (absHash % 28) + 1;
  
  let stipend = 'Unpaid';
  if (isIndiaMode) {
    const stipends = ['₹20,000/mo', '₹30,000/mo', '₹40,000/mo', '₹50,000/mo', '₹60,000/mo', '₹75,000/mo', '₹85,000/mo', '₹1,00,000/mo', 'Unpaid'];
    stipend = stipends[absHash % stipends.length];
  } else {
    const stipends = ['$3,000/mo', '$4,000/mo', '$5,000/mo', '$6,000/mo', '$7,000/mo', '$8,500/mo', '$10,000/mo', '$12,000/mo', 'Unpaid'];
    stipend = stipends[absHash % stipends.length];
  }

  const durations = ['2 Months', '3 Months', '4 Months', '6 Months'];
  const duration = durations[absHash % durations.length];
  return { day, stipend, duration };
}

async function fetchAndParseMD(url: string): Promise<any[]> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}: ${res.status}`);
    }
    const text = await res.text();
    const lines = text.split('\n');
    const listings = [];
    
    // We search for major Indian IT hubs and country India
    const indiaKeywords = [
      'india', 'bengaluru', 'bangalore', 'mumbai', 'pune', 'hyderabad', 
      'noida', 'gurugram', 'gurgaon', 'chennai', 'delhi', 'kolkata', 
      'coimbatore', 'kochi', 'ahmedabad'
    ];
    
    let inTable = false;
    for (const line of lines) {
      // Strikethrough means closed / dropped
      if (line.includes('~~')) {
        continue;
      }
      
      if (line.trim().startsWith('|') && (line.includes('|---|') || line.includes('| --- |'))) {
        inTable = true;
        continue;
      }
      if (inTable && line.trim().startsWith('|')) {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 6) {
          const companyHtml = parts[1];
          const position = parts[2];
          const location = parts[3];
          const postingHtml = parts[4];
          
          // Extract company name
          let company = '';
          const companyMatch = companyHtml.match(/<strong>(.*?)<\/strong>/) || companyHtml.match(/\*\*(.*?)\*\*/);
          if (companyMatch) {
            company = companyMatch[1];
          } else {
            company = companyHtml.replace(/<[^>]*>/g, '').replace(/\*/g, '').trim();
          }
          
          // Extract apply URL
          let applyUrl = '';
          const urlMatch = postingHtml.match(/href="([^"]+)"/) || postingHtml.match(/\(([^)]+)\)/);
          if (urlMatch) {
            applyUrl = urlMatch[1];
          } else {
            applyUrl = postingHtml.replace(/<[^>]*>/g, '').trim();
          }
          
          // Check if India
          const locLower = location.toLowerCase();
          const isIndia = indiaKeywords.some(kw => locLower.includes(kw));
          
          if (isIndia && company && position && applyUrl) {
            listings.push({
              company,
              position,
              location,
              applyUrl
            });
          }
        }
      } else {
        inTable = false;
      }
    }
    return listings;
  } catch (error) {
    console.error(`Error parsing markdown from ${url}:`, error);
    return [];
  }
}

export async function getInternshipsForMonth(monthParam?: string | null, isIndiaMode: boolean = false): Promise<Internship[]> {
  let targetYear = 2025;
  let targetMonth = 6;
  
  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [y, m] = monthParam.split('-');
    targetYear = parseInt(y);
    targetMonth = parseInt(m);
  } else {
    const now = new Date();
    targetYear = now.getFullYear();
    targetMonth = now.getMonth() + 1;
  }

  let internships: Internship[] = [];
  const uniqueListingsMap = new Map<string, any>();

  try {
    if (isIndiaMode) {
      // 1. Fetch SpeedyApply SWE and AI listings concurrently
      const [sweListings, aiListings] = await Promise.all([
        fetchAndParseMD("https://raw.githubusercontent.com/speedyapply/2026-SWE-College-Jobs/main/INTERN_INTL.md"),
        fetchAndParseMD("https://raw.githubusercontent.com/speedyapply/2026-AI-College-Jobs/main/INTERN_INTL.md")
      ]);
      
      const rawIndiaListings = [...sweListings, ...aiListings];
      for (const item of rawIndiaListings) {
        const uniqueStr = `${item.company}-${item.position}-${item.applyUrl}`;
        let hash = 0;
        for (let i = 0; i < uniqueStr.length; i++) {
          hash = (hash << 5) - hash + uniqueStr.charCodeAt(i);
          hash |= 0;
        }
        const id = `in-live-${Math.abs(hash)}`;
        uniqueListingsMap.set(id, {
          id,
          title: item.position,
          company: item.company,
          type: getCategory({ title: item.position, category: '' }),
          url: item.applyUrl,
          location: item.location
        });
      }

      // 2. Also check SimplifyJobs for Indian listings (deduplicating by key)
      const simplifyResponse = await fetch("https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/.github/scripts/listings.json", {
        cache: 'no-store'
      });
      if (simplifyResponse.ok) {
        const simplifyData = await simplifyResponse.json();
        if (Array.isArray(simplifyData)) {
          const activeListings = simplifyData.filter((item: any) => item.active === true && item.url);
          
          const indiaKeywords = [
            'india', 'bengaluru', 'bangalore', 'mumbai', 'pune', 'hyderabad', 
            'noida', 'gurugram', 'gurgaon', 'chennai', 'delhi', 'kolkata', 
            'coimbatore', 'kochi', 'ahmedabad'
          ];
          const isIndianListing = (item: any) => {
            const locations = item.locations || [];
            return locations.some((loc: string) => {
              const l = loc.toLowerCase();
              if (l.includes('indianapolis') || l.includes('indiana')) {
                return false;
              }
              const matchesCity = indiaKeywords.some(keyword => l.includes(keyword));
              const matchesIN = /\b(in)\b/i.test(l) && !/\b(indianapolis|indiana|in, usa|usa|united states)\b/i.test(l);
              return matchesCity || matchesIN;
            });
          };
          
          for (const item of activeListings) {
            if (isIndianListing(item)) {
              const uniqueStr = `${item.company_name || item.company}-${item.title}-${item.url}`;
              let hash = 0;
              for (let i = 0; i < uniqueStr.length; i++) {
                hash = (hash << 5) - hash + uniqueStr.charCodeAt(i);
                hash |= 0;
              }
              const id = `in-simplify-${Math.abs(hash)}`;
              if (!uniqueListingsMap.has(id)) {
                uniqueListingsMap.set(id, {
                  id,
                  title: item.title,
                  company: item.company_name || item.company,
                  type: getCategory(item),
                  url: item.url,
                  location: (item.locations || []).join(', ')
                });
              }
            }
          }
        }
      }
    } else {
      // Global Mode: Fetch only SimplifyJobs and exclude Indian listings
      const simplifyResponse = await fetch("https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/.github/scripts/listings.json", {
        cache: 'no-store'
      });
      if (simplifyResponse.ok) {
        const simplifyData = await simplifyResponse.json();
        if (Array.isArray(simplifyData)) {
          const activeListings = simplifyData.filter((item: any) => item.active === true && item.url);
          
          const indiaKeywords = [
            'india', 'bengaluru', 'bangalore', 'mumbai', 'pune', 'hyderabad', 
            'noida', 'gurugram', 'gurgaon', 'chennai', 'delhi', 'kolkata', 
            'coimbatore', 'kochi', 'ahmedabad'
          ];
          const isIndianListing = (item: any) => {
            const locations = item.locations || [];
            return locations.some((loc: string) => {
              const l = loc.toLowerCase();
              if (l.includes('indianapolis') || l.includes('indiana')) {
                return false;
              }
              const matchesCity = indiaKeywords.some(keyword => l.includes(keyword));
              const matchesIN = /\b(in)\b/i.test(l) && !/\b(indianapolis|indiana|in, usa|usa|united states)\b/i.test(l);
              return matchesCity || matchesIN;
            });
          };
          
          for (const item of activeListings) {
            if (!isIndianListing(item)) {
              const uniqueStr = `${item.company_name || item.company}-${item.title}-${item.url}`;
              let hash = 0;
              for (let i = 0; i < uniqueStr.length; i++) {
                hash = (hash << 5) - hash + uniqueStr.charCodeAt(i);
                hash |= 0;
              }
              const id = `global-${Math.abs(hash)}`;
              uniqueListingsMap.set(id, {
                id,
                title: item.title,
                company: item.company_name || item.company,
                type: getCategory(item),
                url: item.url,
                location: (item.locations || []).join(', ')
              });
            }
          }
        }
      }
    }

    const filteredListings = Array.from(uniqueListingsMap.values());

    if (filteredListings.length > 0) {
      // Group by mapped category
      const groups: Record<'Tech' | 'Finance' | 'Design' | 'Marketing', any[]> = {
        Tech: [],
        Finance: [],
        Design: [],
        Marketing: []
      };
      
      for (const item of filteredListings) {
        const category = item.type as 'Tech' | 'Finance' | 'Design' | 'Marketing';
        if (groups[category]) {
          groups[category].push(item);
        }
      }
      
      // Pad or slice each category to exactly 25 items
      const categories: ('Tech' | 'Finance' | 'Design' | 'Marketing')[] = ['Tech', 'Finance', 'Design', 'Marketing'];
      const combined: any[] = [];

      for (const category of categories) {
        const liveItems = groups[category];
        const mockSource = isIndiaMode ? mockIndiaInternships : mockInternships;
        const categoryMocks = mockSource.filter(mock => mock.type === category);
        
        const cappedItems = [...liveItems];
        const needed = 25 - cappedItems.length;
        if (needed > 0) {
          const padding = categoryMocks.slice(0, needed);
          cappedItems.push(...padding);
        } else {
          cappedItems.length = 25;
        }
        combined.push(...cappedItems);
      }
      
      internships = combined.map((item: any): Internship => {
        const id = item.id || Math.random().toString(36).substring(7);
        const title = item.title || 'Internship Position';
        const company = item.company_name || item.company || 'Confidential';
        const type = item.type || getCategory(item);
        const applyUrl = item.url || item.applyUrl;
        
        const det = getDeterministicValues(id, isIndiaMode);
        const stipend = item.stipend || det.stipend;
        const duration = item.duration || det.duration;
        const deadline = new Date(targetYear, targetMonth - 1, det.day);
        
        return {
          id,
          title,
          company,
          deadline: deadline.toISOString(),
          type,
          stipend,
          duration,
          applyUrl
        };
      });
    }
  } catch (error) {
    console.warn('Real-time feed fetch/parse failed, falling back to mock data:', error);
  }

  // Fallback if network fails, or if parsing results in empty array
  if (internships.length === 0) {
    const currentMocks = isIndiaMode ? mockIndiaInternships : mockInternships;
    internships = currentMocks.map((mock): Internship => {
      const det = getDeterministicValues(mock.id, isIndiaMode);
      const deadline = new Date(targetYear, targetMonth - 1, det.day);
      return {
        ...mock,
        deadline: deadline.toISOString()
      };
    });
  }

  // Sort final list by deadline ascending so they appear sequentially on the calendar
  internships.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  return internships;
}
