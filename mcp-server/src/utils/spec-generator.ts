/**
 * Spec Generator - Extracts structured data from parsed markdown documents
 *
 * Responsibilities:
 * - Extract constitution data from functional specifications
 * - Extract features and their implementation status
 * - Generate implementation plans for incomplete features
 * - Detect feature status based on technical debt analysis
 *
 * @module spec-generator
 */

import { MarkdownParser, MarkdownNode } from './markdown-parser';

/**
 * Implementation status indicator
 */
export type ImplementationStatus = '✅ COMPLETE' | '⚠️ PARTIAL' | '❌ MISSING';

/**
 * Document metadata
 */
export interface DocumentMetadata {
  fileName: string;
  fileSize: number;
  lastModified: Date;
  checksum: string;
}

/**
 * Parsed markdown document
 */
export interface MarkdownDocument {
  filePath: string;
  content: string;
  nodes: MarkdownNode[];
  metadata: DocumentMetadata;
}

/**
 * Technical stack information (Brownfield only)
 */
export interface TechnicalStack {
  languages: string[];
  frameworks: string[];
  databases: string[];
  infrastructure: string[];
  buildTools: string[];
}

/**
 * Development standard
 */
export interface Standard {
  category: 'code-quality' | 'testing' | 'security' | 'documentation';
  description: string;
  enforcementLevel: 'required' | 'recommended' | 'optional';
}

/**
 * Quality metric
 */
export interface QualityMetric {
  name: string;
  target: string;
  current?: string;
  measurement: string;
}

/**
 * Governance rules
 */
export interface GovernanceRules {
  decisionMaking: string;
  changeApproval: string;
  conflictResolution: string;
}

/**
 * Constitution data for template population
 */
export interface ConstitutionData {
  purpose: string;
  values: string[];
  technicalStack?: TechnicalStack;
  developmentStandards: Standard[];
  qualityMetrics: QualityMetric[];
  governance: GovernanceRules;
  route: 'greenfield' | 'brownfield';
}

/**
 * User story
 */
export interface UserStory {
  role: string;
  goal: string;
  benefit: string;
  raw: string;
}

/**
 * Acceptance criterion
 */
export interface AcceptanceCriterion {
  description: string;
  checked: boolean;
  testable: boolean;
}

/**
 * Technical requirements (Brownfield only)
 */
export interface TechnicalRequirements {
  endpoints?: string[];
  dataModels?: string[];
  components?: string[];
  dependencies?: string[];
  files?: string[];
}

/**
 * Feature definition
 */
export interface Feature {
  id: string;
  name: string;
  slug: string;
  description: string;
  userStories: UserStory[];
  acceptanceCriteria: AcceptanceCriterion[];
  status: ImplementationStatus;
  dependencies: string[];
  technicalRequirements?: TechnicalRequirements;
  sourceSection: MarkdownNode;
}

/**
 * Task in implementation plan
 */
export interface Task {
  id: string;
  description: string;
  estimatedHours: number;
  dependencies: string[];
  category: 'frontend' | 'backend' | 'database' | 'testing' | 'documentation';
}

/**
 * Risk in implementation plan
 */
export interface Risk {
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
}

/**
 * Implementation plan for incomplete features
 */
export interface ImplementationPlan {
  featureId: string;
  featureName: string;
  currentState: string;
  targetState: string;
  technicalApproach: string;
  tasks: Task[];
  risks: Risk[];
  estimatedEffort: string;
  dependencies: string[];
}

/**
 * Error thrown when data extraction fails
 */
export class ExtractionError extends Error {
  constructor(
    message: string,
    public phase: 'constitution' | 'features' | 'plans',
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ExtractionError';
  }
}

/**
 * Spec Generator - Extracts structured data from markdown documents
 */
export class SpecGenerator {
  private parser: MarkdownParser;

  constructor() {
    this.parser = new MarkdownParser();
  }

  /**
   * Extract constitution data from functional specification
   * @param doc - Parsed functional-specification.md
   * @param route - Greenfield or Brownfield
   * @returns Constitution data for template population
   * @throws ExtractionError if required data missing
   */
  async extractConstitution(
    doc: MarkdownDocument,
    route: 'greenfield' | 'brownfield'
  ): Promise<ConstitutionData> {
    try {
      // Extract purpose (required)
      const purpose = this.extractPurpose(doc.nodes);
      if (!purpose || purpose.length < 50 || purpose.length > 500) {
        throw new ExtractionError(
          'Purpose must be 50-500 characters',
          'constitution',
          { purpose, length: purpose?.length }
        );
      }

      // Extract core values (required, 3-10 items)
      const values = this.extractValues(doc.nodes);
      if (values.length < 3 || values.length > 10) {
        throw new ExtractionError(
          'Must have 3-10 core values',
          'constitution',
          { count: values.length }
        );
      }

      // Extract technical stack (brownfield only)
      let technicalStack: TechnicalStack | undefined;
      if (route === 'brownfield') {
        technicalStack = this.extractTechnicalStack(doc.nodes);
        if (!technicalStack) {
          throw new ExtractionError(
            'Technical stack required for brownfield route',
            'constitution'
          );
        }
      }

      // Extract development standards (required, ≥ 3 items)
      const developmentStandards = this.extractDevelopmentStandards(doc.nodes);
      if (developmentStandards.length < 3) {
        throw new ExtractionError(
          'Must have at least 3 development standards',
          'constitution',
          { count: developmentStandards.length }
        );
      }

      // Extract quality metrics (required, ≥ 2 items)
      const qualityMetrics = this.extractQualityMetrics(doc.nodes);
      if (qualityMetrics.length < 2) {
        throw new ExtractionError(
          'Must have at least 2 quality metrics',
          'constitution',
          { count: qualityMetrics.length }
        );
      }

      // Extract governance rules (required)
      const governance = this.extractGovernance(doc.nodes);

      return {
        purpose,
        values,
        technicalStack,
        developmentStandards,
        qualityMetrics,
        governance,
        route,
      };
    } catch (error) {
      if (error instanceof ExtractionError) {
        throw error;
      }
      throw new ExtractionError(
        `Failed to extract constitution: ${error}`,
        'constitution',
        { error: String(error) }
      );
    }
  }

  /**
   * Extract features from functional specification
   * @param doc - Parsed functional-specification.md
   * @param debtDoc - Parsed technical-debt-analysis.md (optional)
   * @returns Array of feature definitions
   * @throws ExtractionError if no features found
   */
  async extractFeatures(
    doc: MarkdownDocument,
    debtDoc?: MarkdownDocument
  ): Promise<Feature[]> {
    try {
      const features: Feature[] = [];

      // Find the Features section
      const featuresSection = this.parser.findSection(doc.nodes, /^Features$/i);
      if (!featuresSection) {
        throw new ExtractionError(
          'No Features section found in document',
          'features'
        );
      }

      // Find the index of the Features section in the flat node list
      let featuresSectionIndex = -1;
      for (let i = 0; i < doc.nodes.length; i++) {
        const node = doc.nodes[i];
        if (node.type === 'heading' && node.content === featuresSection.content &&
            node.metadata?.lineNumber === featuresSection.metadata?.lineNumber) {
          featuresSectionIndex = i;
          break;
        }
      }

      if (featuresSectionIndex === -1) {
        // Fallback: just find a heading with matching content
        featuresSectionIndex = doc.nodes.findIndex(
          (n) => n.type === 'heading' && /^Features$/i.test(n.content)
        );
      }

      if (featuresSectionIndex === -1) {
        throw new ExtractionError(
          'Features section not found in node list',
          'features'
        );
      }

      // Get all nodes after the Features heading
      const nodesAfterFeatures = doc.nodes.slice(featuresSectionIndex + 1);

      // Extract H2 or H3 headings as feature names (stop at next H2 that's not a feature)
      let featureHeadings: MarkdownNode[] = [];
      for (const node of nodesAfterFeatures) {
        // Stop if we hit another H1 or H2 section (like "Non-Functional Requirements")
        if (node.type === 'heading' && node.level === 1) {
          break;
        }
        if (node.type === 'heading' && node.level === 2 && featureHeadings.length > 0) {
          // If we've already found some features and hit another H2, check if it's still a feature
          // Simple heuristic: if content is very generic, it might be a different section
          const genericSections = /^(non-functional|technical|overview|summary|appendix)/i;
          if (genericSections.test(node.content)) {
            break;
          }
        }

        if (node.type === 'heading' && (node.level === 2 || node.level === 3)) {
          featureHeadings.push(node);
        }
      }

      if (featureHeadings.length === 0) {
        throw new ExtractionError(
          'No feature headings found in Features section',
          'features'
        );
      }

      // Process each feature
      for (let i = 0; i < featureHeadings.length; i++) {
        const heading = featureHeadings[i];
        const featureName = heading.content.trim();
        const featureId = String(i + 1).padStart(3, '0');
        const slug = this.generateSlug(featureName);

        // Get the content for this feature (everything until next feature heading)
        const featureContent = this.extractFeatureContent(
          doc.nodes,
          i,
          featureHeadings
        );

        // Extract description, user stories, and acceptance criteria
        const description = this.extractDescription(featureContent);
        const userStories = this.extractUserStories(featureContent);
        const acceptanceCriteria = this.extractAcceptanceCriteria(featureContent);
        const technicalRequirements = this.extractTechnicalRequirements(featureContent);

        // Detect status from debt doc
        const status = debtDoc
          ? this.detectStatus({ name: featureName } as Feature, debtDoc)
          : '❌ MISSING';

        features.push({
          id: featureId,
          name: featureName,
          slug,
          description,
          userStories,
          acceptanceCriteria,
          status,
          dependencies: [], // TODO: Extract from document if available
          technicalRequirements,
          sourceSection: heading,
        });
      }

      return features;
    } catch (error) {
      if (error instanceof ExtractionError) {
        throw error;
      }
      throw new ExtractionError(
        `Failed to extract features: ${error}`,
        'features',
        { error: String(error) }
      );
    }
  }

  /**
   * Generate implementation plans for incomplete features
   * @param features - Extracted features
   * @param debtDoc - Technical debt analysis (optional)
   * @returns Map of feature ID to plan content
   */
  async generatePlans(
    features: Feature[],
    debtDoc?: MarkdownDocument
  ): Promise<Map<string, ImplementationPlan>> {
    const plans = new Map<string, ImplementationPlan>();

    for (const feature of features) {
      // Only generate plans for PARTIAL or MISSING features
      if (feature.status === '✅ COMPLETE') {
        continue;
      }

      const plan = await this.generatePlanForFeature(feature, debtDoc);
      plans.set(feature.id, plan);
    }

    return plans;
  }

  /**
   * Detect implementation status for a feature
   * @param feature - Feature to check
   * @param debtDoc - Technical debt analysis
   * @returns Status indicator
   */
  detectStatus(feature: Feature, debtDoc?: MarkdownDocument): ImplementationStatus {
    // If we have a debt doc, check it first
    if (debtDoc) {
      // Look for the feature in the tech debt doc
      const featureSection = this.parser.findSection(
        debtDoc.nodes,
        new RegExp(this.escapeRegex(feature.name), 'i')
      );

      if (featureSection) {
        // Check for status indicators in the content
        const content = this.getSectionContent(featureSection);
        const contentLower = content.toLowerCase();

        // Check for explicit status markers
        if (contentLower.includes('✅ complete') || contentLower.includes('status: complete')) {
          return '✅ COMPLETE';
        }
        if (contentLower.includes('⚠️ partial') || contentLower.includes('status: partial')) {
          return '⚠️ PARTIAL';
        }
        if (contentLower.includes('❌ missing') || contentLower.includes('status: missing')) {
          return '❌ MISSING';
        }

        // Heuristic: look for "What exists" vs "What's missing" sections
        const hasWhatExists = contentLower.includes('what exists');
        const hasWhatsMissing = contentLower.includes("what's missing");

        if (hasWhatExists && hasWhatsMissing) {
          return '⚠️ PARTIAL';
        }
        if (hasWhatExists && !hasWhatsMissing) {
          return '✅ COMPLETE';
        }
        if (!hasWhatExists && hasWhatsMissing) {
          return '❌ MISSING';
        }
      }
    }

    // Fallback: check acceptance criteria completion if available
    if (feature.acceptanceCriteria && feature.acceptanceCriteria.length > 0) {
      const checkedCount = feature.acceptanceCriteria.filter((c) => c.checked).length;
      const totalCount = feature.acceptanceCriteria.length;

      if (checkedCount === totalCount) {
        return '✅ COMPLETE';
      }
      if (checkedCount > 0) {
        return '⚠️ PARTIAL';
      }
      return '❌ MISSING';
    }

    // Default to MISSING if we have no information
    return '❌ MISSING';
  }

  // ==================== Private Helper Methods ====================

  private extractPurpose(nodes: MarkdownNode[]): string {
    const purposeSection = this.parser.findSection(nodes, /^Purpose$/i);
    if (!purposeSection) {
      return '';
    }
    return this.getSectionContent(purposeSection).trim();
  }

  private extractValues(nodes: MarkdownNode[]): string[] {
    // Simplified: Find first list after any "Values" heading
    // This is a pragmatic approach - we can make it more sophisticated later
    const listItems: string[] = [];
    let foundValuesHeading = false;

    for (const node of nodes) {
      // Look for Values heading
      if (node.type === 'heading' && /^(Core )?Values$/i.test(node.content)) {
        foundValuesHeading = true;
        continue;
      }

      // If we found the Values heading and hit a list, collect its items
      if (foundValuesHeading && node.type === 'list') {
        if (node.children) {
          for (const child of node.children) {
            if (child.content) {
              listItems.push(child.content.trim());
            }
          }
        }
        // Got the list, we're done
        break;
      }

      // Stop if we hit another heading after finding Values
      if (foundValuesHeading && node.type === 'heading') {
        break;
      }
    }

    return listItems;
  }

  private extractTechnicalStack(nodes: MarkdownNode[]): TechnicalStack | undefined {
    const techSection = this.parser.findSection(nodes, /^Technical Stack$/i);
    if (!techSection) {
      return undefined;
    }

    const content = this.getSectionContent(techSection);

    // Simple extraction: look for common categories
    const extractCategory = (pattern: RegExp): string[] => {
      const match = content.match(pattern);
      if (!match) return [];
      const items = match[1].split(',').map((s) => s.trim());
      return items.filter((s) => s.length > 0);
    };

    return {
      languages: extractCategory(/(?:Languages?|Frontend|Backend):\s*(.+?)(?:\n|$)/i),
      frameworks: extractCategory(/Frameworks?:\s*(.+?)(?:\n|$)/i),
      databases: extractCategory(/Databases?:\s*(.+?)(?:\n|$)/i),
      infrastructure: extractCategory(/(?:Infrastructure|Deployment):\s*(.+?)(?:\n|$)/i),
      buildTools: extractCategory(/(?:Build Tools?|Tools):\s*(.+?)(?:\n|$)/i),
    };
  }

  private extractDevelopmentStandards(nodes: MarkdownNode[]): Standard[] {
    // Look for common standard sections
    const standards: Standard[] = [];

    // Code quality
    const codeQualitySection = this.parser.findSection(
      nodes,
      /^(Code Quality|Quality Standards)$/i
    );
    if (codeQualitySection) {
      standards.push({
        category: 'code-quality',
        description: this.getSectionContent(codeQualitySection).substring(0, 200),
        enforcementLevel: 'required',
      });
    }

    // Testing
    const testingSection = this.parser.findSection(nodes, /^Testing$/i);
    if (testingSection) {
      standards.push({
        category: 'testing',
        description: this.getSectionContent(testingSection).substring(0, 200),
        enforcementLevel: 'required',
      });
    }

    // Security
    const securitySection = this.parser.findSection(nodes, /^Security$/i);
    if (securitySection) {
      standards.push({
        category: 'security',
        description: this.getSectionContent(securitySection).substring(0, 200),
        enforcementLevel: 'required',
      });
    }

    // Documentation
    const docsSection = this.parser.findSection(nodes, /^Documentation$/i);
    if (docsSection) {
      standards.push({
        category: 'documentation',
        description: this.getSectionContent(docsSection).substring(0, 200),
        enforcementLevel: 'recommended',
      });
    }

    return standards;
  }

  private extractQualityMetrics(nodes: MarkdownNode[]): QualityMetric[] {
    const metrics: QualityMetric[] = [];

    // Look for Performance section
    const perfSection = this.parser.findSection(nodes, /^Performance$/i);
    if (perfSection) {
      const content = this.getSectionContent(perfSection);
      const lines = content.split('\n');
      for (const line of lines) {
        if (line.includes(':')) {
          const [name, target] = line.split(':').map((s) => s.trim());
          if (name && target) {
            metrics.push({
              name,
              target,
              measurement: 'Manual testing or monitoring',
            });
          }
        }
      }
    }

    // Look for Scalability section
    const scaleSection = this.parser.findSection(nodes, /^Scalability$/i);
    if (scaleSection) {
      const content = this.getSectionContent(scaleSection);
      if (content.length > 0) {
        metrics.push({
          name: 'Scalability',
          target: content.substring(0, 100),
          measurement: 'Load testing',
        });
      }
    }

    return metrics;
  }

  private extractGovernance(nodes: MarkdownNode[]): GovernanceRules {
    const governanceSection = this.parser.findSection(nodes, /^Governance$/i);

    const defaultRules: GovernanceRules = {
      decisionMaking: 'Decisions made collaboratively with stakeholder input',
      changeApproval: 'Changes require code review and testing',
      conflictResolution: 'Conflicts resolved through discussion and consensus',
    };

    if (!governanceSection) {
      return defaultRules;
    }

    const content = this.getSectionContent(governanceSection);
    // Simple heuristic: split by sections if available
    return {
      decisionMaking: content.substring(0, 200) || defaultRules.decisionMaking,
      changeApproval: defaultRules.changeApproval,
      conflictResolution: defaultRules.conflictResolution,
    };
  }

  private extractDescription(nodes: MarkdownNode[]): string {
    // First paragraph after heading is usually the description
    for (const node of nodes) {
      if (node.type === 'paragraph' && node.content.trim().length >= 20) {
        return node.content.trim();
      }
    }
    return 'No description available';
  }

  private extractUserStories(nodes: MarkdownNode[]): UserStory[] {
    const stories: UserStory[] = [];

    // Look for "As a X, I want Y, so that Z" pattern
    const userStoryPattern = /As (?:a|an) (.+?), I want (.+?), so that (.+?)\.?$/i;

    for (const node of nodes) {
      if (node.type === 'paragraph') {
        const match = node.content.match(userStoryPattern);
        if (match) {
          stories.push({
            role: match[1].trim(),
            goal: match[2].trim(),
            benefit: match[3].trim(),
            raw: node.content.trim(),
          });
        }
      }
      // Also check list items
      if (node.type === 'list' && node.children) {
        for (const item of node.children) {
          const match = item.content.match(userStoryPattern);
          if (match) {
            stories.push({
              role: match[1].trim(),
              goal: match[2].trim(),
              benefit: match[3].trim(),
              raw: item.content.trim(),
            });
          }
        }
      }
    }

    return stories;
  }

  private extractAcceptanceCriteria(nodes: MarkdownNode[]): AcceptanceCriterion[] {
    const criteria: AcceptanceCriterion[] = [];

    // Look for "Acceptance Criteria" section
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.type === 'heading' && /Acceptance Criteria/i.test(node.content)) {
        // Look at subsequent nodes until we hit another heading
        for (let j = i + 1; j < nodes.length; j++) {
          const nextNode = nodes[j];

          // Stop if we hit another heading
          if (nextNode.type === 'heading') {
            break;
          }

          if (nextNode.type === 'list') {
            const items = this.parser.extractListItems(nextNode);
            for (const item of items) {
              // Handle checkbox syntax: [ ] or [x] or [X]
              const checkboxMatch = item.match(/^\[([xX ])\]\s*(.+)$/);
              if (checkboxMatch) {
                const checked = checkboxMatch[1].toLowerCase() === 'x';
                const description = checkboxMatch[2].trim();
                criteria.push({
                  description,
                  checked,
                  testable: true,
                });
              } else {
                // No checkbox, treat as unchecked
                criteria.push({
                  description: item.trim(),
                  checked: false,
                  testable: true,
                });
              }
            }
          }
        }
        break; // Only process first "Acceptance Criteria" section
      }
    }

    return criteria;
  }

  private extractTechnicalRequirements(nodes: MarkdownNode[]): TechnicalRequirements | undefined {
    // Look for "Technical Requirements" section
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.type === 'heading' && /Technical Requirements/i.test(node.content)) {
        if (i + 1 < nodes.length && nodes[i + 1].type === 'list') {
          const items = this.parser.extractListItems(nodes[i + 1]);
          return {
            dependencies: items.filter((item) => item.toLowerCase().includes('dependency')),
            endpoints: items.filter((item) => item.toLowerCase().includes('endpoint')),
            dataModels: items.filter((item) => item.toLowerCase().includes('database')),
            components: items.filter((item) => item.toLowerCase().includes('component')),
            files: items.filter((item) => item.toLowerCase().includes('file')),
          };
        }
      }
    }
    return undefined;
  }

  private extractFeatureContent(
    allNodes: MarkdownNode[],
    featureIndex: number,
    allFeatureHeadings: MarkdownNode[]
  ): MarkdownNode[] {
    const currentHeading = allFeatureHeadings[featureIndex];
    const nextHeading = featureIndex + 1 < allFeatureHeadings.length
      ? allFeatureHeadings[featureIndex + 1]
      : null;

    // Find the index of current and next heading in allNodes
    const currentIndex = allNodes.indexOf(currentHeading);
    const nextIndex = nextHeading ? allNodes.indexOf(nextHeading) : allNodes.length;

    return allNodes.slice(currentIndex + 1, nextIndex);
  }

  private async generatePlanForFeature(
    feature: Feature,
    debtDoc?: MarkdownDocument
  ): Promise<ImplementationPlan> {
    // Extract current state from debt doc
    let currentState = 'No existing implementation';
    if (debtDoc && feature.status === '⚠️ PARTIAL') {
      const featureSection = this.parser.findSection(
        debtDoc.nodes,
        new RegExp(this.escapeRegex(feature.name), 'i')
      );
      if (featureSection) {
        currentState = this.extractCurrentState(featureSection);
      }
    }

    // Generate target state from user stories and acceptance criteria
    const targetState = this.generateTargetState(feature);

    // Generate technical approach
    const technicalApproach = this.generateTechnicalApproach(feature);

    // Generate tasks
    const tasks = this.generateTasks(feature);

    // Generate risks
    const risks = this.generateRisks(feature);

    // Estimate effort
    const estimatedEffort = this.estimateEffort(tasks);

    return {
      featureId: feature.id,
      featureName: feature.name,
      currentState,
      targetState,
      technicalApproach,
      tasks,
      risks,
      estimatedEffort,
      dependencies: feature.dependencies,
    };
  }

  private extractCurrentState(featureSection: MarkdownNode): string {
    const content = this.getSectionContent(featureSection);

    // Look for "What exists" section - try several patterns
    const patterns = [
      /What exists:?\s*\n([\s\S]+?)(?:\nWhat's missing|$)/i,
      /What exists:?\s*\n([\s\S]+?)(?:\n\n|$)/i,
      /exists:?\s*\n([\s\S]{10,}?)(?:\nmissing|$)/i,
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match && match[1] && match[1].trim().length > 0) {
        return match[1].trim();
      }
    }

    return 'Partial implementation exists (details in technical debt analysis)';
  }

  private generateTargetState(feature: Feature): string {
    const parts: string[] = [feature.description];

    if (feature.userStories.length > 0) {
      parts.push('\nUser Stories:');
      for (const story of feature.userStories) {
        parts.push(`- ${story.raw}`);
      }
    }

    if (feature.acceptanceCriteria.length > 0) {
      parts.push('\nAcceptance Criteria:');
      for (const criterion of feature.acceptanceCriteria) {
        parts.push(`- ${criterion.description}`);
      }
    }

    return parts.join('\n');
  }

  private generateTechnicalApproach(feature: Feature): string {
    const approaches: string[] = [];

    if (feature.technicalRequirements) {
      if (feature.technicalRequirements.endpoints && feature.technicalRequirements.endpoints.length > 0) {
        approaches.push('Implement required API endpoints');
      }
      if (feature.technicalRequirements.components && feature.technicalRequirements.components.length > 0) {
        approaches.push('Build UI components');
      }
      if (feature.technicalRequirements.dataModels && feature.technicalRequirements.dataModels.length > 0) {
        approaches.push('Create database models and migrations');
      }
    }

    if (approaches.length === 0) {
      approaches.push('Implement feature according to acceptance criteria');
      approaches.push('Add comprehensive tests');
      approaches.push('Update documentation');
    }

    return approaches.join('\n- ');
  }

  private generateTasks(feature: Feature): Task[] {
    const tasks: Task[] = [];
    let taskId = 1;

    // Design task
    tasks.push({
      id: `T${taskId++}`,
      description: `Design ${feature.name} architecture`,
      estimatedHours: 2,
      dependencies: [],
      category: 'backend',
    });

    // Implementation tasks based on user stories
    for (const story of feature.userStories) {
      tasks.push({
        id: `T${taskId++}`,
        description: `Implement: ${story.goal}`,
        estimatedHours: 4,
        dependencies: ['T1'],
        category: 'backend',
      });
    }

    // Testing task
    tasks.push({
      id: `T${taskId++}`,
      description: `Write tests for ${feature.name}`,
      estimatedHours: 3,
      dependencies: tasks.slice(1).map((t) => t.id),
      category: 'testing',
    });

    // Documentation task
    tasks.push({
      id: `T${taskId++}`,
      description: `Update documentation for ${feature.name}`,
      estimatedHours: 1,
      dependencies: tasks.map((t) => t.id),
      category: 'documentation',
    });

    return tasks;
  }

  private generateRisks(feature: Feature): Risk[] {
    const risks: Risk[] = [];

    // Default risk
    risks.push({
      description: 'Implementation may be more complex than estimated',
      probability: 'medium',
      impact: 'medium',
      mitigation: 'Break down tasks further if complexity increases',
    });

    // Dependency risk
    if (feature.dependencies.length > 0) {
      risks.push({
        description: 'Dependent features may not be complete',
        probability: 'medium',
        impact: 'high',
        mitigation: 'Verify dependency completion before starting',
      });
    }

    return risks;
  }

  private estimateEffort(tasks: Task[]): string {
    const totalHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);

    if (totalHours <= 8) {
      return `${totalHours} hours (1 day)`;
    }
    if (totalHours <= 40) {
      const days = Math.ceil(totalHours / 8);
      return `${totalHours} hours (${days} days)`;
    }
    const weeks = Math.ceil(totalHours / 40);
    return `${totalHours} hours (${weeks} ${weeks === 1 ? 'week' : 'weeks'})`;
  }

  private getSectionContent(section: MarkdownNode): string {
    if (!section.children) {
      return section.content;
    }

    const parts: string[] = [];
    for (const child of section.children) {
      if (child.type === 'paragraph') {
        parts.push(child.content);
      } else if (child.type === 'list' && child.children) {
        for (const item of child.children) {
          parts.push(`- ${item.content}`);
        }
      } else if (child.type === 'code-block') {
        parts.push(child.content);
      }
    }

    return parts.join('\n');
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
