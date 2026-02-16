# Common Role Archetypes

Reusable role patterns that appear across many agent team designs. Use these as starting points and customize for specific domains.

---

## Planning & Coordination Roles

### Orchestrator

**Core mission:** Decompose complex tasks and coordinate execution

**Typical responsibilities:**
- Analyze incoming requests
- Break work into subtasks
- Route tasks to appropriate specialists
- Track progress
- Synthesize outputs
- Handle failures and retries

**Non-responsibilities:**
- Execute specialist work directly
- Make domain-specific decisions

**Common names:** Orchestrator, Coordinator, Dispatcher, Manager

**Best for:** Orchestrator-worker patterns, complex multi-step workflows

---

### Planner

**Core mission:** Define what needs to be done before execution

**Typical responsibilities:**
- Gather requirements
- Create structured plans
- Identify dependencies
- Define success criteria
- Allocate resources

**Non-responsibilities:**
- Execute the plan
- Approve outputs

**Common names:** Planner, Strategist, Architect, Designer

**Best for:** Pipeline patterns, research workflows

---

### Supervisor

**Core mission:** Manage a team toward objectives with accountability

**Typical responsibilities:**
- Translate strategy to team objectives
- Assign work to team members
- Monitor team progress
- Ensure quality standards
- Report upward
- Escalate issues

**Non-responsibilities:**
- Set organizational strategy
- Execute specialist work

**Common names:** Supervisor, Team Lead, Manager

**Best for:** Hierarchy patterns, enterprise workflows

---

## Execution Roles

### Executor / Worker

**Core mission:** Perform assigned tasks with quality

**Typical responsibilities:**
- Receive and understand assignments
- Execute domain-specific work
- Validate own outputs
- Report completion and issues

**Non-responsibilities:**
- Decide what to work on
- Approve own outputs
- Coordinate with other executors

**Common names:** Worker, Executor, Specialist, Agent

**Best for:** Any pattern with division of labor

---

### Creator

**Core mission:** Produce original artifacts from requirements

**Typical responsibilities:**
- Interpret briefs and requirements
- Research and gather materials
- Create drafts
- Self-edit and refine
- Submit for review

**Non-responsibilities:**
- Approve own work
- Publish outputs

**Common names:** Creator, Writer, Generator, Builder, Developer

**Best for:** Content pipelines, code generation, design workflows

---

### Transformer

**Core mission:** Convert inputs to different formats or structures

**Typical responsibilities:**
- Parse and understand inputs
- Apply transformation rules
- Enrich with additional data
- Format for downstream use
- Document transformations

**Non-responsibilities:**
- Gather source data
- Validate business rules

**Common names:** Transformer, Processor, Converter, Normalizer

**Best for:** Data pipelines, ETL workflows

---

## Quality & Review Roles

### Reviewer

**Core mission:** Evaluate artifacts against criteria

**Typical responsibilities:**
- Apply evaluation criteria
- Identify issues and improvements
- Provide actionable feedback
- Recommend disposition

**Non-responsibilities:**
- Create artifacts
- Make final approval decisions (unless empowered)

**Common names:** Reviewer, Checker, Evaluator, Auditor

**Best for:** Review pipelines, quality gates

---

### Validator

**Core mission:** Verify artifacts meet defined standards

**Typical responsibilities:**
- Check schema and format compliance
- Validate business rules
- Detect anomalies
- Compare against baselines
- Flag or quarantine failures

**Non-responsibilities:**
- Fix issues
- Make judgment calls on subjective quality

**Common names:** Validator, Verifier, QA, Checker

**Best for:** Data pipelines, automated quality gates

---

### Approver / Gatekeeper

**Core mission:** Make final go/no-go decisions

**Typical responsibilities:**
- Review submissions
- Apply approval criteria
- Make approve/reject decisions
- Document rationale
- Escalate edge cases

**Non-responsibilities:**
- Provide detailed feedback (that's Reviewer)
- Execute work

**Common names:** Approver, Gatekeeper, Authority

**Best for:** Compliance-heavy workflows, publication pipelines

---

## Information & Research Roles

### Gatherer

**Core mission:** Collect information from sources

**Typical responsibilities:**
- Connect to data sources
- Execute searches and queries
- Extract relevant content
- Track provenance
- Report coverage and gaps

**Non-responsibilities:**
- Analyze or interpret findings
- Make recommendations

**Common names:** Gatherer, Retriever, Collector, Extractor

**Best for:** Research pipelines, data ingestion

---

### Analyst

**Core mission:** Process information to extract insights

**Typical responsibilities:**
- Organize and categorize data
- Identify patterns and trends
- Resolve conflicts
- Assess confidence
- Create structured analysis

**Non-responsibilities:**
- Gather raw information
- Write final reports

**Common names:** Analyst, Processor, Interpreter

**Best for:** Research pipelines, decision support

---

### Synthesizer

**Core mission:** Combine inputs into coherent outputs

**Typical responsibilities:**
- Integrate multiple sources
- Create narrative coherence
- Draw conclusions
- Develop recommendations
- Format for audience

**Non-responsibilities:**
- Gather or analyze data
- Make final decisions

**Common names:** Synthesizer, Integrator, Combiner, Narrator

**Best for:** Research workflows, report generation

---

## Distribution & Communication Roles

### Publisher

**Core mission:** Deliver artifacts to destinations

**Typical responsibilities:**
- Format for target system
- Execute publication
- Confirm delivery
- Archive artifacts
- Track distribution

**Non-responsibilities:**
- Create content
- Approve content

**Common names:** Publisher, Distributor, Loader, Deployer

**Best for:** Content pipelines, data pipelines

---

### Communicator / Notifier

**Core mission:** Keep stakeholders informed

**Typical responsibilities:**
- Format updates appropriately
- Select right channels
- Ensure timely delivery
- Track acknowledgment

**Non-responsibilities:**
- Decide what to communicate
- Execute work

**Common names:** Notifier, Communicator, Alerter

**Best for:** Monitoring, workflow coordination

---

## Specialized Roles

### Critic / Challenger

**Core mission:** Stress-test ideas and proposals

**Typical responsibilities:**
- Identify weaknesses
- Challenge assumptions
- Present counterarguments
- Assess risks

**Non-responsibilities:**
- Create proposals
- Make final decisions

**Common names:** Critic, Challenger, Devil's Advocate, Red Team

**Best for:** Swarm/debate patterns, decision support

---

### Facilitator

**Core mission:** Manage group processes

**Typical responsibilities:**
- Structure discussions
- Ensure participation
- Track convergence
- Manage time
- Prevent deadlock

**Non-responsibilities:**
- Contribute content
- Make decisions

**Common names:** Facilitator, Moderator, Coordinator

**Best for:** Swarm/debate patterns, collaborative workflows

---

### Monitor

**Core mission:** Observe and report on system state

**Typical responsibilities:**
- Track metrics
- Detect anomalies
- Generate alerts
- Log events

**Non-responsibilities:**
- Take corrective action
- Make decisions

**Common names:** Monitor, Observer, Watcher, Sentinel

**Best for:** Operations, production systems

---

## Choosing Archetypes

### Questions to Ask

1. **What is the primary output?** → Creator, Transformer
2. **What coordination is needed?** → Orchestrator, Planner, Supervisor
3. **What quality checks are needed?** → Reviewer, Validator, Approver
4. **What information processing?** → Gatherer, Analyst, Synthesizer
5. **What distribution?** → Publisher, Communicator

### Combining Roles

Small teams often combine archetypes:
- **Planner + Orchestrator** for simple workflows
- **Creator + Publisher** for internal content
- **Analyst + Synthesizer** for research
- **Reviewer + Approver** for low-risk workflows

### Splitting Roles

Complex teams often split archetypes:
- **Technical Reviewer + Policy Reviewer** for multi-perspective review
- **Supervisor per domain** in hierarchy patterns
- **Multiple Specialists** with different expertise

---

## Archetype Selection Matrix

| If you need to... | Consider |
|-------------------|----------|
| Break down complex tasks | Orchestrator, Planner |
| Produce original content | Creator |
| Transform data formats | Transformer |
| Gather information | Gatherer |
| Analyze and interpret | Analyst |
| Combine multiple inputs | Synthesizer |
| Check quality | Reviewer, Validator |
| Make go/no-go decisions | Approver |
| Deliver outputs | Publisher |
| Manage teams | Supervisor |
| Stress-test ideas | Critic |
| Run group processes | Facilitator |

---

## Application Notes

This pattern is referenced by:
- `create-role-design` skill — presents archetypes during role requirements gathering
- `create-agent` skill — references archetypes when generating agent identity sections
