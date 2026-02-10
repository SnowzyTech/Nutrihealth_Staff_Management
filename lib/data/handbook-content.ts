export interface HandbookTopic {
  id: string;
  title: string;
  content: string;
}

export interface HandbookSection {
  id: string;
  number: string;
  title: string;
  topics: HandbookTopic[];
}

export interface HandbookChapter {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
  sections: HandbookSection[];
}

export const HANDBOOK_CHAPTERS: HandbookChapter[] = [
  {
    id: "about",
    number: "0",
    title: "About This Manual / Disclaimer",
    description: "Purpose, scope, applicability, and legal compliance of this handbook.",
    icon: "info",
    sections: [
      {
        id: "purpose",
        number: "0.1",
        title: "Purpose of This Manual",
        topics: [
          {
            id: "purpose-main",
            title: "Purpose of This Manual",
            content: `This Employee Handbook is designed to provide employees of Nutrihealth Consult with a comprehensive guide to workplace policies, expectations, and best practices. It serves as a reference document outlining the professional and ethical standards expected within our organization, ensuring a harmonious, productive, and legally compliant work environment.

This manual also defines the rights, responsibilities, and benefits afforded to employees, ensuring that all team members are aligned with Nutrihealth Consult's mission, vision, and core values.`
          }
        ]
      },
      {
        id: "scope",
        number: "0.2",
        title: "Scope & Applicability",
        topics: [
          {
            id: "scope-main",
            title: "Scope & Applicability",
            content: `This handbook applies to all employees of Nutrihealth Consult, including full-time, part-time, contract, and temporary staff. It covers policies and procedures that govern day-to-day operations, workplace behaviour, professional conduct, and employment practices.

All employees are required to read, understand, and comply with this handbook. Supervisors and managers must ensure that policies are consistently enforced across all levels of the organization.`
          }
        ]
      },
      {
        id: "disclaimer",
        number: "0.3",
        title: "Disclaimer & Policy Modification Rights",
        topics: [
          {
            id: "disclaimer-main",
            title: "Disclaimer & Policy Modification Rights",
            content: `This handbook is not an employment contract and does not create any binding obligations between Nutrihealth Consult and its employees. Employment at Nutrihealth Consult is at-will, meaning that either the employee or the organization may terminate employment at any time, with or without cause, and with or without notice, unless otherwise stated in a formal employment agreement.

Nutrihealth Consult reserves the sole right to amend, revise, or update any policy, procedure, or provision within this handbook at its discretion. Employees will be notified of any significant changes, and it is their responsibility to stay informed of the latest updates.`
          }
        ]
      },
      {
        id: "employee-responsibility",
        number: "0.4",
        title: "Employee Responsibility",
        topics: [
          {
            id: "employee-responsibility-main",
            title: "Employee Responsibility",
            content: `All employees are expected to read, understand, and adhere to the policies and guidelines outlined in this handbook. If you have any questions or need clarification on any policy, please contact the Human Resources department.`
          }
        ]
      },
      {
        id: "legal-compliance",
        number: "0.5",
        title: "Legal & Compliance Commitment",
        topics: [
          {
            id: "legal-compliance-main",
            title: "Legal & Compliance Commitment",
            content: `Nutrihealth Consult is committed to complying with all applicable labour laws, workplace regulations, and ethical business practices. This handbook aligns with national and international workplace standards to ensure fairness, equity, and professionalism in all aspects of employment.

In the event of any conflict between this handbook and applicable labour laws, the relevant legal provisions shall take precedence.

By working at Nutrihealth Consult, employees commit to upholding the integrity, efficiency, and professionalism that define our workplace culture.`
          }
        ]
      }
    ]
  },
  {
    id: "company-philosophy",
    number: "1",
    title: "Our Company Philosophy",
    description: "Introduction, mission, vision, core values, and what to expect.",
    icon: "heart",
    sections: [
      {
        id: "introduction",
        number: "1.1",
        title: "Introduction",
        topics: [
          {
            id: "introduction-main",
            title: "Introduction",
            content: `Nutrihealth Consult is a fast-growing health and wellness digital consulting company, based in Lagos, Nigeria. We operate at the intersection of natural health care, nutrition education, and digital business growth, helping clients restore their health while supporting health experts to build sustainable, profitable practices.

Nutrihealth Consult was birthed after observing the many unseen battles in the health sector; from misdiagnosis to over-medication and the widespread lack of clear, science-driven guidance on food, supplements, and lifestyle. We exist to offer a better pathway: one that leverages diet, herbal medicine, science-driven education, and personalised counselling to reverse and manage real health conditions in a safe, structured way.

Alongside our client-facing work, we train and support health business owners and product sellers, giving them the skills, systems, and strategy required to monetise, structure, and scale their expertise with both purpose and profit.

As a member of the Nutrihealth team, you are joining a mission-driven organisation that combines clinical responsibility, educational depth, and digital innovation to transform lives and businesses.`
          }
        ]
      },
      {
        id: "mission",
        number: "1.2",
        title: "Our Mission",
        topics: [
          {
            id: "mission-main",
            title: "Our Mission",
            content: `Our mission is to restore and reverse health conditions through diet, herbal medicine, science-driven education, and personalised counselling, while equipping health business owners with the skills and strategic support to build and scale their expertise, so they can deliver credible natural health solutions with both purpose and profit.`
          }
        ]
      },
      {
        id: "vision",
        number: "1.3",
        title: "Our Vision",
        topics: [
          {
            id: "vision-main",
            title: "Our Vision",
            content: `Our vision is to build a global health consulting and research institution that pioneers safe, science-backed dietary and herbal solutions that reverse metabolic and chronic diseases, scales across 36 countries within two decades, and stands as a trusted global voice challenging myths and misinformation in food, nutrition, and natural medicine.`
          }
        ]
      },
      {
        id: "core-values",
        number: "1.4",
        title: "Our Core Values",
        topics: [
          {
            id: "core-values-main",
            title: "Our Core Values",
            content: `At Nutrihealth Consult, our core values are the foundation of everything we do. They guide our decisions, actions, and interactions with customers/patients, colleagues, and partners.

Empathy - Striving to understand and share the feelings of others, including patients, customers, and colleagues. Respecting individual realities, and designing solutions that are both clinically sound and emotionally sensitive.

Integrity - Upholding the highest standards of honesty, ethics, and transparency in all our dealings.

Efficiency - Delivering high-quality outcomes with optimized use of time, resources, and effort.

Effectiveness - Ensuring that our strategies, processes, and interventions produce measurable, meaningful results.

Professionalism - Maintaining excellence, accountability, and respect in every interaction and deliverable.

These values are not just words \u2014 they are the principles that define who we are and how we operate.`
          }
        ]
      },
      {
        id: "overview",
        number: "1.5",
        title: "An Overview of Nutrihealth Consult",
        topics: [
          {
            id: "overview-main",
            title: "An Overview of Nutrihealth Consult",
            content: `Nutrihealth Consult is a millennial-driven digital health consulting outfit positioned in the rapidly growing health and wellness industry. We serve two major groups:

Customers / Patients: individuals living with, or at risk of, conditions such as metabolic disorders, hormonal imbalances, lifestyle-related diseases, and nutritional deficiencies.

Health Experts: dietitians, nutritionists, health coaches, herbal product creators, and wellness practitioners who want to build credible, profitable businesses.

We provide:
- Natural health programmes: using food, herbal supplements, and lifestyle changes to support the body's healing processes.
- Diagnostic-driven counselling: where applicable, we align our advice with medically-relevant data and science-based guidelines.
- Training and mentoring programmes for health experts: helping them package their expertise, attract the right clients, and monetise ethically.

Everything we do is anchored on clear standards, structured systems, and measurable outcomes both in clinical practice and in business development.`
          }
        ]
      },
      {
        id: "expectations-from-you",
        number: "1.6",
        title: "What Nutrihealth Consult Expects From You",
        topics: [
          {
            id: "expectations-from-you-main",
            title: "What Nutrihealth Consult Expects From You",
            content: `As a member of the Nutrihealth Consult team, you play a critical role in our success. We expect you to:

- Demonstrate professionalism, integrity, and a strong work ethic in all aspects of your role.
- Uphold the company's core values of empathy, integrity, efficiency, effectiveness, and professionalism.
- Comply with all company policies, procedures, and legal requirements.
- Continuously seek to improve your skills and knowledge.
- Collaborate effectively with colleagues and contribute to a positive work environment.
- Treat customers, patients, and colleagues with respect and courtesy.
- Maintain confidentiality regarding company information and client data.

By meeting these expectations, you will not only contribute to the success of Nutrihealth Consult but also enhance your own career growth and satisfaction.`
          }
        ]
      },
      {
        id: "expectations-from-us",
        number: "1.7",
        title: "What You Can Expect From Nutrihealth Consult",
        topics: [
          {
            id: "expectations-from-us-main",
            title: "What You Can Expect From Nutrihealth Consult",
            content: `At Nutrihealth Consult, we are committed to creating a work environment that supports and empowers our employees. Here's what you can expect from us:

- A safe, inclusive, and professional work environment.
- Fair compensation and benefits that reflect your contributions.
- Opportunities for professional development and career advancement.
- Open communication and transparency in decision-making.
- Support for work-life balance through flexible policies and leave options.
- Recognition and reward for outstanding performance.
- Access to the tools, resources, and training you need to succeed in your role.`
          }
        ]
      }
    ]
  },
  {
    id: "welcome",
    number: "2",
    title: "Welcome to Nutrihealth Consult",
    description: "Employment policies, conduct standards, and workplace guidelines.",
    icon: "handshake",
    sections: [
      {
        id: "at-will",
        number: "2.1",
        title: "At-Will Employment",
        topics: [
          {
            id: "at-will-main",
            title: "At-Will Employment",
            content: `Your employment with Nutrihealth Consult is at-will. This means that either you or Nutrihealth Consult may terminate the employment relationship at any time with cause or notice. No manager, supervisor, or representative of Nutrihealth Consult, other than the CEO or a designated executive, has the authority to enter into any agreement for employment for a specified period or to make any agreement contrary to this policy. Any such agreement must be in writing and signed by the CEO or a designated executive.

This at-will relationship remains in effect throughout your employment with Nutrihealth Consult, regardless of any changes in your position, compensation, or benefits.`
          }
        ]
      },
      {
        id: "selection",
        number: "2.2",
        title: "How You Were Selected",
        topics: [
          {
            id: "selection-main",
            title: "How You Were Selected",
            content: `At Nutrihealth Consult, we take pride in our rigorous selection process, which ensures that we hire individuals who align with our mission, vision, and values. Your selection was based on a thorough evaluation of your skills, experience, and potential to contribute to our organization.`
          }
        ]
      },
      {
        id: "probation",
        number: "2.3",
        title: "Probationary Period",
        topics: [
          {
            id: "probation-main",
            title: "Probationary Period",
            content: `While completion of the probationary period does not guarantee continued employment, it is an opportunity for both parties to ensure a mutually beneficial relationship. At the end of this period, your supervisor will conduct a performance review to discuss your progress and future goals. Upon successful completion of the probationary period, you will be confirmed as a permanent employee. However, please note that even after confirmation, your employment remains at-will.`
          }
        ]
      },
      {
        id: "anniversary",
        number: "2.4",
        title: "Anniversary Date",
        topics: [
          {
            id: "anniversary-main",
            title: "Anniversary Date",
            content: `Your anniversary date is the first day you reported to work at Nutrihealth Consult. This date is used to calculate various employment milestones, including eligibility for benefits, performance reviews, and promotions. Please ensure that your personal records are up to date with Human Resources to avoid any discrepancies.`
          }
        ]
      },
      {
        id: "confidential",
        number: "2.5",
        title: "Confidential Information",
        topics: [
          {
            id: "confidential-main",
            title: "Confidential Information",
            content: `As an employee of Nutrihealth Consult, you may have access to confidential information, including patient data, business strategies, and proprietary processes. You are required to:

- Sign a Confidentiality Agreement upon employment.
- Safeguard all confidential information during and after your employment.
- Refrain from disclosing or using confidential information for personal gain or unauthorized purposes.`
          }
        ]
      },
      {
        id: "customer-relations",
        number: "2.6",
        title: "Customer Relations",
        topics: [
          {
            id: "customer-relations-main",
            title: "Customer Relations",
            content: `As a representative of Nutrihealth Consult, you are expected to:

- Treat customers/patients with respect, professionalism, and courtesy.
- Respond promptly to client inquiries and requests.
- Ensure there is no conflict of interest, which may lead to disciplinary action, up to and including termination and may also lead to legal consequences.
- Maintain the highest standards of integrity and transparency in all client interactions.

Your ability to build and maintain strong client relationships is critical to our success.`
          }
        ]
      },
      {
        id: "open-communication",
        number: "2.7",
        title: "Open Communication Policy",
        topics: [
          {
            id: "open-communication-main",
            title: "Open Communication Policy",
            content: `At Nutrihealth Consult, we believe that open and honest communication is essential for maintaining a positive and productive work environment. Employees are encouraged to share their ideas, concerns, and feedback through appropriate channels.`
          }
        ]
      },
      {
        id: "equal-opportunity",
        number: "2.8",
        title: "Equal Employment Opportunity",
        topics: [
          {
            id: "equal-opportunity-main",
            title: "Equal Employment Opportunity",
            content: `Nutrihealth Consult is an Equal Opportunity Employer. We do not discriminate on the basis of race, colour, religion, gender, national origin, age, disability, marital status, sexual orientation, or any other characteristic protected by law. All employment decisions are based on merit, qualifications, and business needs.

We are committed to providing a workplace that is inclusive, diverse, and free from discrimination. If you believe you have been subjected to any form of discrimination, please report it to HR immediately.`
          }
        ]
      },
      {
        id: "non-harassment",
        number: "2.9",
        title: "Non-Harassment Policy",
        topics: [
          {
            id: "non-harassment-main",
            title: "Non-Harassment Policy",
            content: `Nutrihealth Consult is committed to maintaining a workplace free from harassment of any kind. Harassment based on race, gender, religion, age, disability, or any other protected characteristic is strictly prohibited.

If you experience or witness any form of harassment, report it immediately to your supervisor, HR, or through our anonymous reporting channels. All complaints will be investigated promptly and confidentially.`
          }
        ]
      },
      {
        id: "sexual-harassment",
        number: "2.10",
        title: "Sexual Harassment Policy",
        topics: [
          {
            id: "sexual-harassment-main",
            title: "Sexual Harassment Policy",
            content: `Sexual harassment is a violation of Nutrihealth Consult's values and policies. Prohibited behaviour includes:

- Unwelcome sexual advances or requests for sexual favours.
- Inappropriate comments, jokes, or gestures of a sexual nature.
- Displaying sexually explicit materials in the workplace.

If you experience or witness sexual harassment, report it immediately. Nutrihealth Consult will take appropriate action to address the issue and ensure a safe work environment.`
          }
        ]
      },
      {
        id: "drug-alcohol",
        number: "2.11",
        title: "Drug and Alcohol-Free Workplace",
        topics: [
          {
            id: "drug-alcohol-main",
            title: "Drug and Alcohol-Free Workplace",
            content: `At Nutrihealth Consult, we are committed to maintaining a safe, healthy, and productive work environment for all employees, clients, and visitors. Nutrihealth Consult strictly prohibits the use, possession, distribution, or being under the influence of illegal drugs or alcohol on company premises, during working hours, or while representing the organisation in any capacity.

Prohibited Conduct:
- Use or Possession: Using, possessing, or distributing illegal drugs or alcohol on company property or during work hours.
- Being Under the Influence: Reporting to work or performing job duties while under the influence of alcohol, illegal drugs, or any substance that impairs judgment.
- Prescription Medications: Using prescription medications in a manner inconsistent with their prescribed purpose. Employees must notify their supervisor if taking medications that may affect job performance.
- Distribution or Sale: Distributing, selling, or attempting to sell illegal drugs or alcohol on company property.

Violations of this policy will result in disciplinary action, up to and including termination of employment.`
          }
        ]
      },
      {
        id: "workplace-violence",
        number: "2.12",
        title: "Workplace Violence",
        topics: [
          {
            id: "workplace-violence-main",
            title: "Workplace Violence",
            content: `Nutrihealth Consult has a zero-tolerance policy for workplace violence. Workplace violence is defined as any act or threat of physical violence, bullying, harassment, intimidation, or other disruptive behaviour.

Prohibited conduct includes:
- Threats: Making verbal, written, or physical threats of harm.
- Physical Violence: Engaging in physical assaults, fights, or aggressive behaviour.
- Intimidation or Harassment: Using gestures, language, or actions intended to intimidate or bully.
- Possession of Weapons: Bringing firearms, knives, or dangerous objects onto company property.
- Destruction of Property: Intentionally damaging company property or others' property.

All reports will be treated confidentially and investigated promptly. Violations will result in disciplinary action, up to and including termination, and may be reported to law enforcement.`
          }
        ]
      },
      {
        id: "standards-conduct",
        number: "2.13",
        title: "Standards of Conduct",
        topics: [
          {
            id: "standards-conduct-main",
            title: "Standards of Conduct",
            content: `At Nutrihealth Consult, we expect all employees to adhere to the highest standards of conduct. This includes:

- Treating colleagues, clients, and stakeholders with respect and professionalism.
- Upholding our core values of empathy, integrity, efficiency, effectiveness, and professionalism.
- Complying with all company policies, procedures, and legal requirements.
- Ensuring there is no conflict of interest, which may lead to disciplinary action, up to and including termination and may also lead to legal consequences.`
          }
        ]
      },
      {
        id: "unacceptable",
        number: "2.14",
        title: "Unacceptable Activities",
        topics: [
          {
            id: "unacceptable-main",
            title: "Unacceptable Activities",
            content: `The following activities are strictly prohibited and may result in disciplinary action, up to and including termination:

Falsification of Records or Documents: Intentionally altering, fabricating, or misrepresenting information in company records or documents. Examples include falsifying timesheets, expense reports, or attendance records.

Insubordination or Refusal to Follow Lawful Instructions: Deliberately refusing to comply with reasonable and lawful instructions from a supervisor or manager, including ignoring direct instructions or disrespectful behaviour.

Behaviour That Disrupts the Workplace: Engaging in actions that create a hostile or unprofessional work environment or damage Nutrihealth Consult's reputation, including spreading rumours, bullying, or posting inappropriate content about the company.

Additional unacceptable activities include negligence, conflict of interest, unauthorized disclosure of confidential information, and gambling or illegal activities on company premises.`
          }
        ]
      },
      {
        id: "disciplinary",
        number: "2.15",
        title: "Disciplinary Actions",
        topics: [
          {
            id: "disciplinary-main",
            title: "Disciplinary Actions",
            content: `Nutrihealth Consult follows a progressive discipline approach. However, in cases of severe misconduct, the company reserves the right to skip progressive steps and proceed directly to termination.

The progressive discipline steps typically include:
1. Verbal warning
2. Written warning
3. Final written warning
4. Suspension (where applicable)
5. Termination of employment`
          }
        ]
      },
      {
        id: "termination",
        number: "2.16",
        title: "Termination of Employment",
        topics: [
          {
            id: "termination-main",
            title: "Termination of Employment",
            content: `Employment at Nutrihealth Consult is at-will. Termination may occur for reasons including poor performance, violation of company policies, misconduct, or organisational restructuring.

Termination requires one month's notice or one month's salary in lieu of notice.

Responsibilities upon termination include:
- Return Company Property: All company-owned items (ID cards, laptops, keys, access cards, uniforms, and documents) must be returned.
- Complete an exit interview if requested.
- Failure to return company property may result in deductions from final pay or legal action.`
          }
        ]
      },
      {
        id: "arbitration",
        number: "2.17",
        title: "Arbitration Policy",
        topics: [
          {
            id: "arbitration-main",
            title: "Arbitration Policy",
            content: `By accepting employment with Nutrihealth Consult, you agree to resolve any disputes arising from your employment through binding arbitration rather than litigation in court.

This policy applies to disputes including claims of wrongful termination, discrimination, harassment, wages, benefits, compensation, or breach of contract.

Key terms:
- Binding Arbitration: The arbitrator's decision is final and cannot be appealed except in limited circumstances.
- Waiver of Jury Trial: You waive your right to a jury trial.
- Selection of Arbitrator: Through a mutually agreed-upon process.

This policy does not apply to claims for workers' compensation, unemployment benefits, or claims that cannot legally be subject to arbitration.`
          }
        ]
      }
    ]
  },
  {
    id: "operational",
    number: "3",
    title: "Operational Policies",
    description: "Employee classifications, working hours, timekeeping, compensation, and performance.",
    icon: "settings",
    sections: [
      {
        id: "classifications",
        number: "3.1",
        title: "Employee Classifications",
        topics: [
          {
            id: "classifications-main",
            title: "Employee Classifications",
            content: `Nutrihealth Consult classifies employees based on job role, hours worked, and employment status. Standard working pattern is 40 hours per week, typically 8:00 a.m. to 5:00 p.m., Monday to Friday.

Full-Time Employees:
- Work an average of at least 40 hours per week.
- May be rostered for occasional or regular weekend shifts where the role requires.
- Eligible for full company benefits upon successful completion of probation (minimum 3 months, maximum 6 months).

Part-Time Employees:
- Work fewer than 40 hours per week on a regular basis.
- May be scheduled on specific weekdays and/or weekends as agreed in contract.
- Eligible for statutory benefits and additional benefits on a pro-rata basis.

Temporary / Contract Employees:
- Engaged for a defined period, project, or campaign.
- May work flexible schedules depending on project needs.
- Not eligible for full benefits package except where required by law.`
          }
        ]
      },
      {
        id: "records",
        number: "3.2",
        title: "Employment Records",
        topics: [
          {
            id: "records-main",
            title: "Employment Records",
            content: `Nutrihealth Consult maintains accurate and confidential employment records for all employees. These records include:

- Personal information (name, address, contact details)
- Employment history (job title, start date, promotions)
- Performance evaluations and disciplinary actions
- Payroll and benefits information

Employees are responsible for ensuring their records are up to date. Notify the Human Resources department of any changes to your personal information.`
          }
        ]
      },
      {
        id: "working-hours",
        number: "3.3",
        title: "Working Hours and Schedule",
        topics: [
          {
            id: "working-hours-main",
            title: "Working Hours and Schedule",
            content: `Standard working hours are 8:00 a.m. to 5:00 p.m., Monday through Friday, with a one-hour lunch break between 12pm to 2pm (must not exceed 1 hour).

Attendance and Punctuality:
- Arrive on time and be ready to work at the start of your scheduled shift.
- Notify your supervisor at least 1 hour before start time if you will be late or absent.
- Follow the company's absence reporting procedures.

Consequences of Poor Attendance:
Patterns of unexcused absence, frequent lateness, or leaving early without approval may lead to progressive disciplinary action.

Meal Periods:
- Employees are entitled to one (1) hour unpaid lunch break during their shift.
- Lunch breaks should be scheduled to minimise disruption to operations.

Nutrihealth Consult is committed to supporting employees in achieving a healthy balance between work and personal life.`
          }
        ]
      },
      {
        id: "timekeeping",
        number: "3.4",
        title: "Timekeeping Procedures",
        topics: [
          {
            id: "timekeeping-main",
            title: "Timekeeping Procedures",
            content: `Accurate timekeeping ensures fair compensation and compliance with labour laws.

Non-Exempt Employees must:
- Log start time, end time, and break periods using the designated timekeeping system.
- Record all hours worked, including overtime.
- Submit time records daily or as specified by their department.
- Obtain preapproval for overtime hours.

Prohibited Practices (zero-tolerance):
- Falsifying time records or altering hours worked.
- Recording hours not actually worked.
- Tampering with timekeeping systems.

Employee Responsibilities:
- Submit time records promptly and in accordance with procedures.
- Report any issues or discrepancies to HR or your supervisor immediately.

Supervisor Responsibilities:
- Review and approve employee time records in a timely manner.
- Monitor for compliance and address any discrepancies.`
          }
        ]
      },
      {
        id: "compensation",
        number: "3.5",
        title: "Compensation",
        topics: [
          {
            id: "compensation-main",
            title: "Compensation",
            content: `Nutrihealth Consult is committed to providing fair and competitive compensation to all employees.

Pay Errors: Employees who believe there is an error in their pay should notify HR immediately for resolution.`
          }
        ]
      },
      {
        id: "travel-expense",
        number: "3.6",
        title: "Reimbursement of Travel Expense",
        topics: [
          {
            id: "travel-expense-main",
            title: "Reimbursement of Travel Expense",
            content: `Nutrihealth Consult reimburses temporary employees for reasonable and necessary travel expenses incurred while performing work-related duties.

Approved Expenses:
- Transportation: airfare, train tickets, or mileage for personal vehicle use.
- Meals: reasonable meal expenses during travel, subject to daily limits.
- Lodging: hotel or accommodation costs for overnight stays.
- Other: parking fees, tolls, and other necessary expenses.

Submission:
- Submit an expense report with receipts within 30 days of completing the trip.
- Reports should include date, purpose, and details of each expense.

Approval: All travel expenses must be pre-approved by your supervisor. Unapproved expenses will not be reimbursed.`
          }
        ]
      },
      {
        id: "performance-review",
        number: "3.7",
        title: "Performance Review",
        topics: [
          {
            id: "performance-review-main",
            title: "Performance Review",
            content: `Performance reviews serve to recognize contributions, evaluate achievements, provide feedback, set goals, support development, and recognize excellence.

Nutrihealth Consult conducts performance reviews at multiple intervals throughout the year.

Evaluation Criteria:
- Job Performance and Key Performance Indicators (KPIs)
- Initiative and Innovation
- Adherence to Company Values and Policies (Empathy, Integrity, Efficiency, Effectiveness, Professionalism)
- Quality of Work (accuracy, thoroughness, meeting standards, problem-solving)
- Teamwork and Collaboration
- Communication skills
- Professionalism (punctuality, reliability, positive attitude, leadership)

The evaluation process is designed to foster a culture of continuous learning and growth.`
          }
        ]
      }
    ]
  },
  {
    id: "benefits",
    number: "4",
    title: "Benefits",
    description: "Overview of benefits, eligibility, tool allowance, training assistance, and holidays.",
    icon: "gift",
    sections: [
      {
        id: "benefits-overview",
        number: "4.1",
        title: "Benefits Overview",
        topics: [
          {
            id: "benefits-overview-main",
            title: "Benefits Overview",
            content: `Our benefits package includes:

Financial Allowances:
- Tool Allowances: Reimbursement for job-specific tools and equipment.

Professional Development:
- Training Assistance: Financial support for courses, certifications, and workshops.
- Study Leave: Paid or unpaid leave to pursue further education (subject to management approval).

Paid Leave:
- Various leave options including holidays, maternity, paternity, sick leave, and more.

Health and Wellness:
- Initiatives to promote physical and mental well-being.

These benefits are designed to enhance your overall experience at Nutrihealth Consult.`
          }
        ]
      },
      {
        id: "eligibility",
        number: "4.2",
        title: "Eligibility for Benefits",
        topics: [
          {
            id: "eligibility-main",
            title: "Eligibility for Benefits",
            content: `Full-Time Employees: Work an average of at least 40 hours per week or 160 hours per month. Eligible for the full range of benefits upon successful completion of the probation period.

Part-Time Employees: May be eligible for certain benefits, especially if they work at least 30 hours per week. Specific eligibility depends on the duration of employment and company policies.

Variable and Seasonal Employees: Eligibility is assessed based on average hours worked and specific terms outlined in employment contracts.`
          }
        ]
      },
      {
        id: "tool-allowance",
        number: "4.3",
        title: "Tool Allowance",
        topics: [
          {
            id: "tool-allowance-main",
            title: "Tool Allowance",
            content: `Purpose: To reimburse employees for the purchase of tools and equipment essential for their roles.

Eligibility: Employees whose roles require specific tools or equipment, such as clinic, consultation, logistics, or e-commerce staff.

Employee Responsibilities:
- Proper Use: Ensure tools are used primarily for work-related purposes.
- Maintenance: Maintain tools in good condition and report any loss or damage promptly.

Nutrihealth Consult will conduct periodic audits to ensure adherence to this policy and provide guidance on approved tools.`
          }
        ]
      },
      {
        id: "training-assistance",
        number: "4.4",
        title: "Training Assistance",
        topics: [
          {
            id: "training-assistance-main",
            title: "Training Assistance",
            content: `Nutrihealth Consult supports continuous learning and professional development.

Procedure:
1. Submit a formal training request to your immediate supervisor and HR.
2. Include details of the intended examination, its relevance to your role, and associated costs.
3. Budget for training assistance should not exceed \u20A6300,000.

Reimbursement is only granted upon successful completion of the examination. Employees must provide proof of certification and relevant payment receipts to HR.`
          }
        ]
      },
      {
        id: "paid-holidays",
        number: "4.5",
        title: "Paid Holidays",
        topics: [
          {
            id: "paid-holidays-main",
            title: "Paid Holidays",
            content: `All full-time employees are entitled to paid time off on official public holidays recognized in Nigeria. These typically include New Year's Day, Good Friday, Easter Saturday, Easter Sunday, and other federal/state holidays.

Part-Time Employees: Entitled to paid public holidays on a pro-rata basis.

Additional Considerations:
- If a public holiday falls on a weekend, the following Monday may be observed.
- Employees wishing to observe additional religious or cultural holidays may request unpaid leave or use accrued paid time off, subject to management approval.
- In exceptional cases requiring work on a public holiday, employees will be compensated in accordance with applicable labour laws.`
          }
        ]
      }
    ]
  },
  {
    id: "leave-policies",
    number: "5",
    title: "Leave Policies",
    description: "Annual leave, sick leave, study leave, compassionate leave, maternity and paternity leave.",
    icon: "calendar",
    sections: [
      {
        id: "annual-leave",
        number: "5.1",
        title: "Annual Leave",
        topics: [
          {
            id: "annual-leave-main",
            title: "Annual Leave",
            content: `Entitlement:
Senior Employees:
- Less than 36 months of service: 14 working days per year.
- More than 36 months of service: 21 working days per year.

Leave is accrued on a pro-rata basis for new employees. Unused leave cannot be carried over to the next year.

Application Procedure:
1. Submit a Leave Application Form to your immediate supervisor at least two weeks in advance.
2. Include start and end dates of the requested leave.
3. HR ensures the application complies with company policy.
4. Employees are notified of approval or denial within 5 working days.

Employee Responsibilities:
- Plan ahead and submit requests well in advance.
- Coordinate with your team to ensure minimal disruption.
- Use annual leave within the calendar year.`
          }
        ]
      },
      {
        id: "sick-leave",
        number: "5.2",
        title: "Sick Leave",
        topics: [
          {
            id: "sick-leave-main",
            title: "Sick Leave",
            content: `Purpose: To allow employees time to recover from illness, injury, or medical conditions.

Entitlement: Up to 12 working days of paid sick leave per year (pro-rated for part-time staff). Unused sick leave does not carry forward.

Notification:
- Notify your immediate supervisor as soon as possible, no later than 8:00 a.m. on the first day of absence.
- Contact via phone call and/or official messaging platform.

Documentation:
- 1-2 consecutive days: No medical certificate required by default, but may be requested.
- 3 or more consecutive days: A medical certificate from a licensed healthcare provider is required.

Misuse of Sick Leave:
Misuse includes repeated patterns around weekends/holidays, using sick leave for non-medical activities, or providing false information. Confirmed misuse may lead to disciplinary action up to and including termination.`
          }
        ]
      },
      {
        id: "study-leave",
        number: "5.3",
        title: "Study Leave",
        topics: [
          {
            id: "study-leave-main",
            title: "Study Leave",
            content: `Purpose: To allow employees time off to attend examinations, workshops, training sessions, or complete coursework related to their studies.

The course or program should be directly related to the employee's current job responsibilities or future career goals within the organization.

Application:
- Submit study leave requests at least 4 weeks in advance.
- Include all necessary supporting documents.
- HR and your immediate supervisor will review the request, considering relevance, performance record, and operational needs.
- Employees are notified within 5 working days.

Upon completion, employees must provide evidence of successful completion (transcripts or certificates).`
          }
        ]
      },
      {
        id: "compassionate-leave",
        number: "5.4",
        title: "Compassionate Leave",
        topics: [
          {
            id: "compassionate-leave-main",
            title: "Compassionate Leave",
            content: `Entitlement: Up to 5 working days of paid compassionate leave per year (pro-rated for part-time employees).

Purpose: To provide time for employees to address urgent family emergencies.

Employee Responsibilities:
- Communicate promptly with your supervisor and HR.
- Provide accurate documentation.
- Coordinate with your team to ensure minimal disruption during your absence.

Compassionate leave is automatically approved for genuine emergencies. HR may follow up for verification if necessary.`
          }
        ]
      },
      {
        id: "maternity-leave",
        number: "5.5",
        title: "Maternity Leave",
        topics: [
          {
            id: "maternity-leave-main",
            title: "Maternity Leave",
            content: `Entitlement: Eligible female employees are entitled to 12 weeks (3 months) of maternity leave.

Application Procedure:
1. Submit a maternity leave request form to your supervisor and HR.
2. Include expected start and end dates.
3. Provide a medical certificate confirming pregnancy and expected due date.

Nutrihealth Consult's Responsibilities:
- Ensure compliance with company policy and labour laws.
- Provide support and resources for planning leave and transition back to work.
- Maintain confidentiality regarding all pregnancy-related information.
- Temporarily reassign responsibilities to ensure minimal disruption.`
          }
        ]
      },
      {
        id: "paternity-leave",
        number: "5.6",
        title: "Paternity Leave",
        topics: [
          {
            id: "paternity-leave-main",
            title: "Paternity Leave",
            content: `Entitlement: 2 weeks of fully paid paternity leave upon the birth of a child. Available to employees who have completed 12 months of continuous service.

Purpose: To allow new fathers time to bond with their newborns and support their partners.

Employee Responsibilities:
- Notify your supervisor and HR as soon as possible after the birth.
- Submit proof of the child's birth within 7 days of taking leave.
- Coordinate with your team to ensure a smooth handover.

During your absence, responsibilities will be temporarily reassigned to a colleague.`
          }
        ]
      }
    ]
  },
  {
    id: "conduct",
    number: "6",
    title: "General Standards of Conduct",
    description: "Office policy, meetings, workplace conduct, outside employment, and more.",
    icon: "shield",
    sections: [
      {
        id: "office-policy",
        number: "6.1",
        title: "Office Policy",
        topics: [
          {
            id: "office-policy-main",
            title: "Office Policy",
            content: `Purpose: To maintain a professional, organized, and safe workspace that fosters productivity, collaboration, and employee satisfaction.

Employee Expectations:
- Keep your workspace clean and clutter-free.
- Organize your desk and work area regularly.
- Dispose of trash properly and recycle where possible.
- Respect shared spaces (kitchen, meeting rooms, etc.).

Nutrihealth Consult's Commitment:
- Provide a safe, clean, well-lit, and adequately ventilated office.
- Regularly maintain office equipment and facilities.
- Offer necessary resources for employees to perform their roles.
- Provide feedback mechanisms for employees to suggest improvements.`
          }
        ]
      },
      {
        id: "meetings",
        number: "6.2",
        title: "Meetings",
        topics: [
          {
            id: "meetings-main",
            title: "Meetings",
            content: `Employee Expectations:
- Review the agenda and pre-read materials before the meeting.
- Bring necessary documents, tools, or data.
- Participate actively and respect others' opinions.
- Avoid side conversations or distractions during meetings.
- Follow up on action items promptly.

Internal Meeting Rhythms:
- Daily Stand-Up (Department Level): Short 10-20 minute check-in each weekday morning.
- First Saturday of the Month: Team Training session (company-wide or departmental).
- Last Friday of the Month: Team Meeting with performance review, recognition, updates, and reflections.

Nutrihealth Consult's Commitment:
- Schedule meetings with clear agendas shared at least 24 hours in advance.
- Avoid unnecessary or overlapping meetings.
- End meetings on time or earlier if objectives are achieved.`
          }
        ]
      },
      {
        id: "workplace-conduct",
        number: "6.3",
        title: "Workplace Conduct",
        topics: [
          {
            id: "workplace-conduct-main",
            title: "Workplace Conduct",
            content: `At Nutrihealth Consult, we are committed to fostering a respectful, inclusive, and professional workplace where every employee feels valued, safe, and empowered to contribute their best.

All employees are expected to:
- Treat colleagues, clients, and visitors with respect and courtesy.
- Maintain professional behaviour at all times.
- Avoid disruptive, offensive, or inappropriate conduct.
- Report any concerns about workplace behaviour to HR.

Violations of workplace conduct standards may result in disciplinary action.`
          }
        ]
      },
      {
        id: "outside-employment",
        number: "6.4",
        title: "Outside Employment",
        topics: [
          {
            id: "outside-employment-main",
            title: "Outside Employment",
            content: `Employees considering outside employment must ensure it does not conflict with their responsibilities at Nutrihealth Consult. Any outside employment must not:

- Interfere with your work schedule or performance.
- Create a conflict of interest with Nutrihealth Consult's business.
- Involve the use of company resources or proprietary information.

Employees must disclose any outside employment to HR for review and approval.`
          }
        ]
      },
      {
        id: "company-id",
        number: "6.5",
        title: "Company ID / Door Access Cards",
        topics: [
          {
            id: "company-id-main",
            title: "Company ID / Door Access Cards",
            content: `All employees are issued company identification and door access cards. These must be:

- Worn or carried at all times while on company premises.
- Used to access authorized areas only.
- Reported immediately if lost or stolen.
- Returned upon termination of employment.

Misuse of ID or access cards may result in disciplinary action.`
          }
        ]
      },
      {
        id: "punctuality",
        number: "6.6",
        title: "Punctuality and Attendance",
        topics: [
          {
            id: "punctuality-main",
            title: "Punctuality and Attendance",
            content: `Regular attendance and punctuality are essential to maintaining productivity and teamwork.

Employees are expected to:
- Arrive on time for their scheduled shifts.
- Notify supervisors promptly of any absence or tardiness.
- Follow all absence reporting procedures.

Patterns of poor attendance may result in progressive disciplinary action.`
          }
        ]
      },
      {
        id: "confidential-company",
        number: "6.7",
        title: "Confidential Company Information",
        topics: [
          {
            id: "confidential-company-main",
            title: "Confidential Company Information",
            content: `Employees must protect all confidential company information, including business strategies, client data, financial information, and proprietary processes.

This means:
- Never sharing confidential information with unauthorized parties.
- Using secure methods to store and transmit sensitive data.
- Reporting any suspected breaches of confidentiality immediately.
- Maintaining confidentiality obligations even after leaving the company.`
          }
        ]
      },
      {
        id: "conflict-interest",
        number: "6.8",
        title: "Conflict of Interest and Business Ethics",
        topics: [
          {
            id: "conflict-interest-main",
            title: "Conflict of Interest and Business Ethics",
            content: `Employees must avoid situations that create or appear to create a conflict between their personal interests and the interests of Nutrihealth Consult.

This includes avoiding:
- Financial interests in competitors or suppliers.
- Personal relationships that may influence business decisions.
- Accepting gifts or favours that may compromise objectivity.

All potential conflicts must be disclosed to HR for review.`
          }
        ]
      },
      {
        id: "facilities",
        number: "6.9",
        title: "Use of Facilities, Equipment, and Property",
        topics: [
          {
            id: "facilities-main",
            title: "Use of Facilities, Equipment, and Property",
            content: `Company facilities, equipment, and property are provided for business purposes. Employees must:

- Use equipment and facilities responsibly and for authorized purposes only.
- Report any damage, malfunction, or maintenance needs promptly.
- Not remove company property from the premises without authorization.
- Return all company property upon termination.

Misuse or theft of company property will result in disciplinary action and may lead to legal consequences.`
          }
        ]
      },
      {
        id: "health-safety",
        number: "6.10",
        title: "Health and Safety",
        topics: [
          {
            id: "health-safety-main",
            title: "Health and Safety",
            content: `Nutrihealth Consult is committed to providing a safe and healthy work environment. All employees are expected to:

- Follow all health and safety procedures and guidelines.
- Report any hazards, accidents, or near-misses immediately.
- Participate in safety training as required.
- Use personal protective equipment (PPE) when required.
- Maintain a clean and organized work area.

The company will regularly review and update safety procedures to ensure compliance with applicable regulations.`
          }
        ]
      },
      {
        id: "social-media",
        number: "6.11",
        title: "Use of Social Media",
        topics: [
          {
            id: "social-media-main",
            title: "Use of Social Media",
            content: `Employees must exercise good judgment when using social media, both personally and professionally.

Guidelines:
- Do not post confidential or proprietary information about Nutrihealth Consult.
- Do not make statements that could be interpreted as representing Nutrihealth Consult's official position without authorization.
- Be respectful and professional in all online interactions.
- Do not engage in harassment, defamation, or inappropriate behaviour online.
- Personal social media use should not interfere with job responsibilities.

Violations of this policy may result in disciplinary action.`
          }
        ]
      },
      {
        id: "inspections",
        number: "6.12",
        title: "Inspections",
        topics: [
          {
            id: "inspections-main",
            title: "Inspections",
            content: `Nutrihealth Consult reserves the right to conduct inspections of company property, including desks, lockers, vehicles, and electronic devices, to ensure compliance with company policies and applicable laws.

Inspections may be conducted:
- Randomly or for cause.
- With or without prior notice.
- By authorized personnel only.

Employees are expected to cooperate fully with any inspection.`
          }
        ]
      }
    ]
  },
  {
    id: "appendix",
    number: "7",
    title: "Appendix",
    description: "Employee acknowledgment and agreements.",
    icon: "file-text",
    sections: [
      {
        id: "acknowledgment",
        number: "7.1",
        title: "Employee Acknowledgment and Agreements",
        topics: [
          {
            id: "acknowledgment-main",
            title: "Employee Acknowledgment and Agreements",
            content: `By signing the acknowledgment form, you confirm that you have received, read, and understood the contents of this Employee Handbook. You agree to comply with all policies, procedures, and guidelines outlined herein.

This acknowledgment does not constitute an employment contract and does not alter the at-will nature of your employment with Nutrihealth Consult.`
          }
        ]
      }
    ]
  }
];

// Helper to flatten all topics for search
export function getAllTopics() {
  const topics: Array<{
    chapterId: string;
    chapterTitle: string;
    chapterNumber: string;
    sectionId: string;
    sectionTitle: string;
    sectionNumber: string;
    topicId: string;
    topicTitle: string;
    content: string;
  }> = [];

  for (const chapter of HANDBOOK_CHAPTERS) {
    for (const section of chapter.sections) {
      for (const topic of section.topics) {
        topics.push({
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          chapterNumber: chapter.number,
          sectionId: section.id,
          sectionTitle: section.title,
          sectionNumber: section.number,
          topicId: topic.id,
          topicTitle: topic.title,
          content: topic.content,
        });
      }
    }
  }

  return topics;
}

export function getChapterById(id: string) {
  return HANDBOOK_CHAPTERS.find((c) => c.id === id);
}

export function getSectionById(chapterId: string, sectionId: string) {
  const chapter = getChapterById(chapterId);
  return chapter?.sections.find((s) => s.id === sectionId);
}
