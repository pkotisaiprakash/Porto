const fs = require('fs');
const path = require('path');

// Improved resume parser using multiple strategies
// Extracts: name, email, phone, skills, education, experience from resume text

class ResumeParser {
  constructor() {
    // Common skills patterns - expanded list
    this.skillsPatterns = [
      'javascript', 'react', 'node.js', 'nodejs', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go',
      'html', 'css', 'sql', 'mongodb', 'mysql', 'postgresql', 'redis', 'docker', 'kubernetes',
      'aws', 'azure', 'gcp', 'git', 'github', 'rest api', 'graphql', 'typescript', 'angular',
      'vue', 'jquery', 'bootstrap', 'tailwind', 'express', 'django', 'flask', 'spring',
      'redux', 'mongoose', 'sequelize', 'linux', 'unix', 'bash', 'restful', 'microservices',
      'agile', 'scrum', 'jenkins', 'ci/cd', 'testing', 'jest', 'mocha', 'selenium',
      'machine learning', 'data science', 'ai', 'deep learning', 'tensorflow', 'pytorch',
      'flutter', 'react native', 'ios', 'android', 'swift', 'kotlin', 'figma', 'photoshop',
      'communication', 'leadership', 'problem-solving', 'problem solving', 'teamwork', 'time management',
      'web development', 'software development', 'full stack', 'fullstack', 'frontend', 'backend',
      'database', 'api', 'rest', 'json', 'xml', 'html5', 'css3', 'es6', 'npm', 'yarn',
      'jira', 'confluence', 'agile', 'waterfall', 'oop', 'mvc', 'restful api',
      // Additional common tech skills
      'c', 'c programming', 'r', 'matlab', 'perl', 'scala', 'swift', 'shell', 'powershell',
      'mongodb', 'firebase', 'sqlite', 'oracle', 'mariadb', 'cassandra', 'elasticsearch',
      'heroku', 'netlify', 'vercel', 'digitalocean', 'heroku',
      'vs code', 'visual studio code', 'eclipse', 'intellij', 'pycharm', 'android studio',
      'postman', 'swagger', 'insomnia',
      'mern', 'mean', 'lamp', 'mevn',
      'jquery', 'sass', 'less', 'webpack', 'vite', 'babel',
      'electron', 'pwa', 'spa', 'ssr',
      'blockchain', 'ethereum', 'solidity', 'web3',
      'arduino', 'raspberry pi', 'iot',
      'figma', 'adobe xd', 'sketch', 'illustrator', 'indesign',
      'tableau', 'power bi', 'excel', 'spss', 'sas'
    ];

    // Education keywords
    this.educationKeywords = ['university', 'college', 'bachelor', 'master', 'phd', 'degree', 'diploma', 'school', 'institute', 'academy', 'education','b.tech','m.tech','b.sc','m.sc','mba','b.e','m.e'];
    
    // Experience keywords  
    this.experienceKeywords = ['experience', 'work', 'job', 'employment', 'intern', 'internship', 'developer', 'engineer', 'manager', 'analyst', 'consultant', 'designer', 'architect', 'lead', 'senior', 'junior', 'associate'];
  }

  async parseResume(filePath, originalName) {
    try {
      const ext = path.extname(originalName).toLowerCase();
      let text = '';

      if (ext === '.pdf') {
        text = await this.parsePDF(filePath);
      } else if (ext === '.docx') {
        text = await this.parseDOCX(filePath);
      } else if (ext === '.doc') {
        // Try DOCX parser first, fallback to text
        try {
          text = await this.parseDOCX(filePath);
        } catch (e) {
          text = fs.readFileSync(filePath, 'utf8');
        }
      } else {
        // Try as plain text
        text = fs.readFileSync(filePath, 'utf8');
      }

      console.log('Extracted text length:', text.length);
      console.log('First 500 chars:', text.substring(0, 500));

      // Even if text is minimal, try to extract what we can
      if (!text || text.trim().length < 10) {
        console.log('Warning: Very little text extracted, but continuing with available data');
        // Return basic extraction from filename or empty data
        return this.extractData(' '); // Will return empty structure but try best
      }

      return this.extractData(text);
    } catch (error) {
      console.error('Resume parsing error:', error);
      throw new Error('Failed to parse resume: ' + error.message);
    }
  }

  async parsePDF(filePath) {
    try {
      const pdfParse = require('pdf-parse');
      const dataBuffer = fs.readFileSync(filePath);
      
      const options = {
        max: 100 // Maximum number of pages to parse
      };
      
      const data = await pdfParse(dataBuffer, options);
      
      if (!data) {
        throw new Error('No data returned from pdf-parse');
      }
      
      const text = data.text || '';
      
      if (!text || text.trim().length < 10) {
        // Try alternative - get from pages array
        if (data.pages && data.numpages > 0) {
          const pageTexts = [];
          for (let i = 1; i <= data.numpages; i++) {
            if (data.pages[i-1] && data.pages[i-1].text) {
              pageTexts.push(data.pages[i-1].text);
            }
          }
          if (pageTexts.length > 0) {
            return pageTexts.join('\n');
          }
        }
        throw new Error('PDF text extraction returned empty');
      }
      
      return text;
    } catch (error) {
      console.error('PDF parse error:', error.message);
      // Return empty string instead of throwing - let the controller handle gracefully
      return '';
    }
  }

  async parseDOCX(filePath) {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ path: filePath });
    if (!result.value || result.value.trim().length < 10) {
      // Try with options
      const resultWithOptions = await mammoth.extractRawText({
        path: filePath,
        styleMap: [
          "p[style-name='Heading 1'] => h1:bold",
          "p[style-name='Heading 2'] => h2:bold"
        ]
      });
      return resultWithOptions.value;
    }
    return result.value;
  }

  extractData(text) {
    // Use raw text for extraction, minimal cleaning
    // The previous aggressive cleaning was corrupting extracted text
    const cleanText = text;
    const lines = text.split(/\n/).map(line => line.trim()).filter(line => line.length > 0);

    const data = {
      name: '',
      email: '',
      phone: '',
      title: '',
      bio: '',
      skills: [],
      education: [],
      experience: [],
      location: ''
    };

    // Extract email - more comprehensive regex
    const emailMatch = cleanText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi);
    if (emailMatch && emailMatch.length > 0) {
      // Get the most likely email (not from keywords like github.com)
      const validEmail = emailMatch.find(e => 
        !e.toLowerCase().includes('example') && 
        !e.toLowerCase().includes('test')
      );
      data.email = validEmail || emailMatch[0];
    }

    // Extract phone - more flexible patterns
    const phonePatterns = [
      /\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,  // Standard US format
      /\+?91[-.\s]?\d{10}/g,  // India format
      /\+?\d{10,12}/g,  // 10-12 digit numbers without separators
      /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,  // Without country code
      /\d{1,3}[-.\s]\d{3}[-.\s]\d{4}/g  // Short format
    ];
    
    for (const pattern of phonePatterns) {
      const phoneMatch = cleanText.match(pattern);
      if (phoneMatch && phoneMatch.length > 0) {
        data.phone = phoneMatch[0].replace(/\s+/g, ' ').trim();
        break;
      }
    }

    // Extract name (usually first non-empty line that looks like a name)
    // Skip lines that look like headers, footers, or contact info
    const skipPatterns = ['resume', 'cv', 'curriculum', 'phone', 'email', 'address', '@', 'http', 'software', 'engineer', 'developer', 'manager', 'analyst', 'designer', 'projects', 'skills', 'education', 'certificates', 'interests', 'technologies', 'database', 'languages'];
    
    for (const line of lines.slice(0, 15)) {
      const lowerLine = line.toLowerCase();
      
      // Skip if line contains any skip pattern
      if (skipPatterns.some(p => lowerLine.includes(p))) continue;
      
      // Skip if line contains digits (but allow some numbers like years)
      if (/\d{4,}/.test(line)) continue;
      
      // Skip if line has special characters (other than basic punctuation)
      if (/[^a-zA-Z\s.\-']/.test(line)) continue;
      
      const words = line.split(/\s+/).filter(w => w.length > 0);
      
      // Name should be 2-5 words, each starting with capital
      if (words.length >= 2 && words.length <= 5) {
        const isCapitalized = words.every(w => 
          w.length > 0 && w[0] === w[0].toUpperCase()
        );
        
        if (isCapitalized) {
          data.name = line;
          break;
        }
      }
    }
    
    // Also try to find name by looking for name patterns in the resume
    // The name often appears after section headers like Interests (best match)
    if (!data.name) {
      // Interests is usually the last section before name in this format
      const interestsRegex = /interests[^a-zA-Z]*\n\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){2,4})/i;
      const match = text.match(interestsRegex);
      if (match && match[1]) {
        const potentialName = match[1].split('\n')[0].trim();
        if (potentialName && potentialName.length > 3) {
          data.name = potentialName;
        }
      }
    }
    
    // Fallback: try other keywords
    if (!data.name) {
      const afterKeywords = ['education', 'certificates', 'projects', 'skills'];
      for (const keyword of afterKeywords) {
        const regex = new RegExp(keyword + '[^a-zA-Z]*\n\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){2,4})', 'i');
        const match = text.match(regex);
        if (match && match[1]) {
          const potentialName = match[1].split('\n')[0].trim();
          // Verify it looks like a name (not a project or skill)
          if (potentialName && potentialName.length > 3 && 
              !potentialName.toLowerCase().includes('project') &&
              !potentialName.toLowerCase().includes('skill') &&
              !potentialName.toLowerCase().includes('certificate')) {
            data.name = potentialName;
            break;
          }
        }
      }
    }
    
    // If name still not found, try extracting from filename (fallback)
    if (!data.name && originalName) {
      const nameFromFile = originalName
        .replace(/\.(pdf|doc|docx)$/i, '')
        .replace(/[-_]/g, ' ')
        .replace(/\d+/g, '')
        .trim();
      if (nameFromFile.length > 2 && nameFromFile.length < 50) {
        data.name = nameFromFile;
      }
    }

    // Extract skills
    // First try from labeled sections like "Languages: Java, Python"
    const lowerText = cleanText.toLowerCase();
    const foundSkills = new Set();
    
    // Also extract skills from labeled sections
    const skillSectionPatterns = [
      /(?:languages?|programming|technologies?|tech\s*skills?)\s*[:;]\s*([A-Za-z0-9+,\s#+&./()]-*)+/gi,
      /(?:database|databases)\s*[:;]\s*([A-Za-z0-9+,\s#+&./()]-*)+/gi,
      /(?:tools?\s*(?:&\s*tech)?|frameworks?|libraries?)\s*[:;]\s*([A-Za-z0-9+,\s#+&./()]-*)+/gi,
      /(?:web\s*development|web\s*technologies?)\s*[:;]\s*([A-Za-z0-9+,\s#+&./()]-*)+/gi,
      /(?:android|ios|mobile)\s*[:;]\s*([A-Za-z0-9+,\s#+&./()]-*)+/gi
    ];
    
    for (const pattern of skillSectionPatterns) {
      let match;
      while ((match = pattern.exec(cleanText)) !== null) {
        const skillStr = match[1];
        if (skillStr) {
          const skills = skillStr.split(/[,;+#&\n\/()]/).map(s => s.trim()).filter(s => s.length > 1 && s.length < 30);
          for (const skill of skills) {
            // Only include alphanumeric skills
            if (/^[a-zA-Z0-9+\.\s]+$/.test(skill)) {
              const formattedSkill = skill.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
              foundSkills.add(formattedSkill);
            }
          }
        }
      }
    }
    
    // Also match individual skills from the skillsPatterns
    for (const skill of this.skillsPatterns) {
      if (lowerText.includes(skill)) {
        const formattedSkill = skill.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        foundSkills.add(formattedSkill);
      }
    }
    
    data.skills = Array.from(foundSkills).slice(0, 20); // Limit to 20 skills

    // Extract education - look for common patterns in resumes
    const educationSection = this.extractSection(text, this.educationKeywords);
    
    // Try to find specific education entries from the resume format
    // Look for college name followed by degree type
    const eduPattern = /(?:university|college|institute|school|academy|of\s+engineering|of\s+technology|of\s+science)[^a-zA-Z]*\s*([A-Za-z][A-Za-z\s,.'-]+(?:\s+[A-Za-z][A-Za-z\s,.'-]+)*)/gi;
    const eduMatches = [...text.matchAll(eduPattern)];
    
    if (eduMatches.length > 0) {
      for (const match of eduMatches.slice(0, 3)) {
        const institution = match[1]?.trim();
        
        if (institution && institution.length > 3 && institution.length < 80) {
          // Extract degree from nearby text
          let degree = '';
          const degreePatterns = [
            /B\.?\s*Tech?/i,
            /M\.?\s*Tech?/i,
            /B\.?\s*Sc/i,
            /M\.?\s*Sc/i,
            /B\.?\s*E/i,
            /M\.?\s*E/i,
            /MBA/i,
            /PhD/i,
            /Bachelor'?s?/i,
            /Master'?s?/i,
            /Diploma/i
          ];
          
          for (const dp of degreePatterns) {
            if (dp.test(text)) {
              degree = dp.source.replace(/\?/g, '').replace(/\^/g, '').replace(/\\/g, '');
              break;
            }
          }
          
          // Extract year
          const yearMatch = institution.match(/\b(20\d{2}|19\d{2})\b/);
          
          const education = {
            institution: institution.replace(/\b(20\d{2}|19\d{2})\b/g, '').trim(), // Remove year from institution
            degree: degree || '',
            field: '',
            startDate: yearMatch ? yearMatch[0] : '',
            endDate: ''
          };
          
          // Try to extract field of study
          const fieldMatch = institution.match(/(?:computer science|engineering|technology|business|arts|science|commerce|information technology)/i);
          if (fieldMatch) {
            education.field = fieldMatch[0];
          }
          
          data.education.push(education);
        }
      }
    } else if (educationSection && educationSection.length > 10) {
      // Fallback to original method
      const eduLines = educationSection.split(/[\n,;]/).filter(line => {
        const trimmed = line.trim();
        return trimmed.length > 10 && trimmed.length < 200;
      });
      
      for (const edu of eduLines.slice(0, 5)) {
        const trimmed = edu.trim();
        if (trimmed.length > 10 && trimmed.length < 150) {
          const yearMatch = trimmed.match(/\b(19|20)\d{2}\b/);
          const education = {
            institution: trimmed,
            degree: '',
            field: '',
            startDate: yearMatch ? yearMatch[0] : '',
            endDate: ''
          };
          
          const lowerTrimmed = trimmed.toLowerCase();
          if (lowerTrimmed.includes('bachelor') || lowerTrimmed.includes('b.sc') || lowerTrimmed.includes('b.e') || lowerTrimmed.includes('b.tech')) {
            education.degree = "Bachelor's Degree";
          } else if (lowerTrimmed.includes('master') || lowerTrimmed.includes('m.sc') || lowerTrimmed.includes('m.e') || lowerTrimmed.includes('m.tech') || lowerTrimmed.includes('mba')) {
            education.degree = "Master's Degree";
          } else if (lowerTrimmed.includes('phd') || lowerTrimmed.includes('doctorate')) {
            education.degree = 'PhD';
          } else if (lowerTrimmed.includes('diploma')) {
            education.degree = 'Diploma';
          }
          
          data.education.push(education);
        }
      }
    }

    // Extract experience
    const expSection = this.extractSection(text, this.experienceKeywords);
    if (expSection && expSection.length > 10) {
      // Split by newlines or experience keywords
      const expParts = expSection.split(/(?:\n|experience|work|employment)/i).slice(1, 8);
      
      for (const exp of expParts) {
        const trimmed = exp.trim();
        if (trimmed.length > 20 && trimmed.length < 300) {
          // Extract year if present
          const yearMatch = trimmed.match(/\b(19|20)\d{2}\b/);
          const experience = {
            title: '',
            company: '',
            location: '',
            startDate: yearMatch ? yearMatch[0] : '',
            endDate: '',
            description: trimmed.substring(0, 200)
          };
          
          // Try to extract title and company
          const parts = trimmed.split(/\s+at\s+|\s+@\s+|\s*,\s*/);
          if (parts.length > 1) {
            experience.title = parts[0].trim();
            experience.company = parts[1].trim();
          } else {
            experience.title = trimmed.substring(0, 50);
          }
          
          data.experience.push(experience);
        }
      }
    }

    // Generate bio from first few lines (excluding contact info)
    const contactPatterns = ['@', 'phone', 'tel', 'fax', 'http', 'www.'];
    const bioLines = lines.slice(0, 8).filter(line => 
      line.length > 20 && 
      !contactPatterns.some(p => line.toLowerCase().includes(p)) &&
      !line.match(/^\d+$/) &&
      !data.skills.some(s => line.toLowerCase().includes(s.toLowerCase())) &&
      line.length < 200
    );
    
    if (bioLines.length > 0) {
      data.bio = bioLines.join(' ').substring(0, 500);
    }

    // Try to extract title from resume
    const titlePatterns = [
      'software engineer', 'web developer', 'full stack', 'fullstack', 'front end', 'frontend', 'back end', 'backend',
      'data scientist', 'machine learning', 'devops', 'cloud engineer', 'manager', 'analyst', 'designer',
      'consultant', 'architect', 'lead', 'senior', 'junior', 'associate', 'intern'
    ];
    
    for (const pattern of titlePatterns) {
      if (lowerText.includes(pattern)) {
        data.title = pattern.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        break;
      }
    }

    // Try to extract location
    const locationPatterns = [
      /(?:location|address|city)[:\s]+([A-Za-z\s,]+(?:\d{5})?)/i,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2})\s*\d{5}/,
      /([A-Z][a-z]+,\s*[A-Z]{2})/
    ];
    
    for (const pattern of locationPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        data.location = match[1] || match[0];
        break;
      }
    }

    return data;
  }

  extractSection(text, keywords) {
    const lines = text.split('\n');
    let inSection = false;
    let sectionText = '';
    const sectionKeywords = keywords.join('|');
    let consecutiveEmptyLines = 0;

    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      const trimmedLine = line.trim();
      
      // Count consecutive empty lines
      if (trimmedLine.length === 0) {
        consecutiveEmptyLines++;
        if (consecutiveEmptyLines > 2 && inSection) {
          // End of section after 2+ empty lines
          break;
        }
        continue;
      } else {
        consecutiveEmptyLines = 0;
      }
      
      // Check if this line contains any section keywords
      if (new RegExp(sectionKeywords, 'i').test(lowerLine)) {
        inSection = true;
        sectionText += line + ' ';
      } else if (inSection && (lowerLine.includes('----') || lowerLine.match(/^[A-Z\s]{3,}$/))) {
        // End of section
        break;
      } else if (inSection) {
        sectionText += line + ' ';
      }
    }

    return sectionText.trim();
  }
}

module.exports = new ResumeParser();
