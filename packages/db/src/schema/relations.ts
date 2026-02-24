import { relations } from "drizzle-orm";

import {
	account,
	notificationPreferences,
	pushSubscriptions,
	session,
	user,
} from "./auth";
import {
	clientRateHistory,
	clients,
	projectOwners,
	projects,
} from "./client-project";
import { expenseCategories, expenses } from "./finance";
import { mbTicketIssues, mbTickets } from "./mb";
import {
	memberRateHistory,
	memberTagAssignments,
	memberTags,
	organizationMembers,
	organizations,
	subTypeMultipliers,
} from "./organization";
import {
	sprintTasks,
	sprintTemplateSteps,
	sprintTemplates,
	sprints,
} from "./sprint";
import { timeEntries, timeEntryReviewers } from "./time";
import {
	checklistItems,
	departmentMembers,
	departments,
	taskComments,
	taskReviewers,
	tasks,
} from "./work";

export const userRelations = relations(user, ({ many, one }) => ({
	account: many(account),
	session: many(session),
	organizationMembers: many(organizationMembers),
	timeEntries: many(timeEntries, { relationName: "timeEntryUser" }),
	reviewedTimeEntries: many(timeEntries, { relationName: "timeEntryReviewer" }),
	timeEntryReviewAssignments: many(timeEntryReviewers),
	pushSubscriptions: many(pushSubscriptions),
	notificationPreference: one(notificationPreferences, {
		fields: [user.id],
		references: [notificationPreferences.userId],
	}),
}));

export const pushSubscriptionsRelations = relations(
	pushSubscriptions,
	({ one }) => ({
		user: one(user, {
			fields: [pushSubscriptions.userId],
			references: [user.id],
		}),
	}),
);

export const notificationPreferencesRelations = relations(
	notificationPreferences,
	({ one }) => ({
		user: one(user, {
			fields: [notificationPreferences.userId],
			references: [user.id],
		}),
	}),
);

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
	members: many(organizationMembers),
	clients: many(clients),
	projects: many(projects),
	departments: many(departments),
	timeEntries: many(timeEntries),
	subTypeMultipliers: many(subTypeMultipliers),
	memberTags: many(memberTags),
	expenseCategories: many(expenseCategories),
	expenses: many(expenses),
}));

export const organizationMembersRelations = relations(
	organizationMembers,
	({ one, many }) => ({
		user: one(user, {
			fields: [organizationMembers.userId],
			references: [user.id],
		}),
		organization: one(organizations, {
			fields: [organizationMembers.organizationId],
			references: [organizations.id],
		}),
		rateHistory: many(memberRateHistory),
		tagAssignments: many(memberTagAssignments),
	}),
);

export const subTypeMultipliersRelations = relations(
	subTypeMultipliers,
	({ one }) => ({
		organization: one(organizations, {
			fields: [subTypeMultipliers.organizationId],
			references: [organizations.id],
		}),
	}),
);

export const memberRateHistoryRelations = relations(
	memberRateHistory,
	({ one }) => ({
		member: one(organizationMembers, {
			fields: [memberRateHistory.memberId],
			references: [organizationMembers.id],
		}),
		changedBy: one(user, {
			fields: [memberRateHistory.changedById],
			references: [user.id],
		}),
	}),
);

export const memberTagsRelations = relations(memberTags, ({ one, many }) => ({
	organization: one(organizations, {
		fields: [memberTags.organizationId],
		references: [organizations.id],
	}),
	assignments: many(memberTagAssignments),
}));

export const memberTagAssignmentsRelations = relations(
	memberTagAssignments,
	({ one }) => ({
		member: one(organizationMembers, {
			fields: [memberTagAssignments.memberId],
			references: [organizationMembers.id],
		}),
		tag: one(memberTags, {
			fields: [memberTagAssignments.tagId],
			references: [memberTags.id],
		}),
		assignedBy: one(user, {
			fields: [memberTagAssignments.assignedById],
			references: [user.id],
		}),
	}),
);

export const expenseCategoriesRelations = relations(
	expenseCategories,
	({ one, many }) => ({
		organization: one(organizations, {
			fields: [expenseCategories.organizationId],
			references: [organizations.id],
		}),
		parent: one(expenseCategories, {
			fields: [expenseCategories.parentId],
			references: [expenseCategories.id],
			relationName: "categoryParent",
		}),
		children: many(expenseCategories, { relationName: "categoryParent" }),
		expenses: many(expenses),
	}),
);

export const expensesRelations = relations(expenses, ({ one }) => ({
	organization: one(organizations, {
		fields: [expenses.organizationId],
		references: [organizations.id],
	}),
	category: one(expenseCategories, {
		fields: [expenses.categoryId],
		references: [expenseCategories.id],
	}),
	createdBy: one(user, {
		fields: [expenses.createdById],
		references: [user.id],
	}),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
	organization: one(organizations, {
		fields: [clients.organizationId],
		references: [organizations.id],
	}),
	projects: many(projects),
	rateHistory: many(clientRateHistory),
}));

export const clientRateHistoryRelations = relations(
	clientRateHistory,
	({ one }) => ({
		client: one(clients, {
			fields: [clientRateHistory.clientId],
			references: [clients.id],
		}),
		changedBy: one(user, {
			fields: [clientRateHistory.changedById],
			references: [user.id],
		}),
	}),
);

export const projectsRelations = relations(projects, ({ one, many }) => ({
	organization: one(organizations, {
		fields: [projects.organizationId],
		references: [organizations.id],
	}),
	client: one(clients, {
		fields: [projects.clientId],
		references: [clients.id],
	}),
	tasks: many(tasks),
	timeEntries: many(timeEntries),
	sprints: many(sprints),
	owners: many(projectOwners),
}));

export const projectOwnersRelations = relations(projectOwners, ({ one }) => ({
	project: one(projects, {
		fields: [projectOwners.projectId],
		references: [projects.id],
	}),
	user: one(user, {
		fields: [projectOwners.userId],
		references: [user.id],
	}),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
	project: one(projects, {
		fields: [tasks.projectId],
		references: [projects.id],
	}),
	createdBy: one(user, {
		fields: [tasks.createdById],
		references: [user.id],
		relationName: "createdBy",
	}),
	assignedTo: one(user, {
		fields: [tasks.assignedToId],
		references: [user.id],
		relationName: "assignedTo",
	}),
	department: one(departments, {
		fields: [tasks.departmentId],
		references: [departments.id],
	}),
	checklistItems: many(checklistItems),
	reviewers: many(taskReviewers),
	comments: many(taskComments),
	timeEntries: many(timeEntries, { relationName: "timeEntryTask" }),
	sprintTasks: many(sprintTasks),
}));

export const checklistItemsRelations = relations(checklistItems, ({ one }) => ({
	task: one(tasks, {
		fields: [checklistItems.taskId],
		references: [tasks.id],
	}),
}));

export const timeEntriesRelations = relations(timeEntries, ({ one, many }) => ({
	user: one(user, {
		fields: [timeEntries.userId],
		references: [user.id],
		relationName: "timeEntryUser",
	}),
	organization: one(organizations, {
		fields: [timeEntries.organizationId],
		references: [organizations.id],
	}),
	project: one(projects, {
		fields: [timeEntries.projectId],
		references: [projects.id],
	}),
	task: one(tasks, {
		fields: [timeEntries.taskId],
		references: [tasks.id],
		relationName: "timeEntryTask",
	}),
	sprint: one(sprints, {
		fields: [timeEntries.sprintId],
		references: [sprints.id],
	}),
	reviewer: one(user, {
		fields: [timeEntries.reviewerId],
		references: [user.id],
		relationName: "timeEntryReviewer",
	}),
	approvedBy: one(user, {
		fields: [timeEntries.approvedById],
		references: [user.id],
		relationName: "timeEntryApprovedBy",
	}),
	rejectedBy: one(user, {
		fields: [timeEntries.rejectedById],
		references: [user.id],
		relationName: "timeEntryRejectedBy",
	}),
	supervisedEntry: one(timeEntries, {
		fields: [timeEntries.supervisedEntryId],
		references: [timeEntries.id],
		relationName: "timeEntrySupervisedEntry",
	}),
	mbTicket: one(mbTickets, {
		fields: [timeEntries.mbTicketId],
		references: [mbTickets.id],
		relationName: "timeEntryMbTicket",
	}),
	reviewers: many(timeEntryReviewers),
}));

export const timeEntryReviewersRelations = relations(
	timeEntryReviewers,
	({ one }) => ({
		timeEntry: one(timeEntries, {
			fields: [timeEntryReviewers.timeEntryId],
			references: [timeEntries.id],
		}),
		user: one(user, {
			fields: [timeEntryReviewers.userId],
			references: [user.id],
		}),
	}),
);

export const departmentsRelations = relations(departments, ({ one, many }) => ({
	organization: one(organizations, {
		fields: [departments.organizationId],
		references: [organizations.id],
	}),
	members: many(departmentMembers),
	tasks: many(tasks),
	sprintTasks: many(sprintTasks),
	sprintTemplateSteps: many(sprintTemplateSteps),
}));

export const taskReviewersRelations = relations(taskReviewers, ({ one }) => ({
	task: one(tasks, {
		fields: [taskReviewers.taskId],
		references: [tasks.id],
	}),
	user: one(user, {
		fields: [taskReviewers.userId],
		references: [user.id],
	}),
}));

export const taskCommentsRelations = relations(taskComments, ({ one }) => ({
	task: one(tasks, {
		fields: [taskComments.taskId],
		references: [tasks.id],
	}),
	user: one(user, {
		fields: [taskComments.userId],
		references: [user.id],
	}),
}));

export const departmentMembersRelations = relations(
	departmentMembers,
	({ one }) => ({
		user: one(user, {
			fields: [departmentMembers.userId],
			references: [user.id],
		}),
		department: one(departments, {
			fields: [departmentMembers.departmentId],
			references: [departments.id],
		}),
		organization: one(organizations, {
			fields: [departmentMembers.organizationId],
			references: [organizations.id],
		}),
	}),
);

export const sprintTemplatesRelations = relations(
	sprintTemplates,
	({ one, many }) => ({
		organization: one(organizations, {
			fields: [sprintTemplates.organizationId],
			references: [organizations.id],
		}),
		createdBy: one(user, {
			fields: [sprintTemplates.createdById],
			references: [user.id],
		}),
		steps: many(sprintTemplateSteps),
		sprints: many(sprints),
	}),
);

export const sprintTemplateStepsRelations = relations(
	sprintTemplateSteps,
	({ one }) => ({
		template: one(sprintTemplates, {
			fields: [sprintTemplateSteps.templateId],
			references: [sprintTemplates.id],
		}),
		department: one(departments, {
			fields: [sprintTemplateSteps.departmentId],
			references: [departments.id],
		}),
	}),
);

export const sprintsRelations = relations(sprints, ({ one, many }) => ({
	project: one(projects, {
		fields: [sprints.projectId],
		references: [projects.id],
	}),
	organization: one(organizations, {
		fields: [sprints.organizationId],
		references: [organizations.id],
	}),
	template: one(sprintTemplates, {
		fields: [sprints.templateId],
		references: [sprintTemplates.id],
	}),
	createdBy: one(user, {
		fields: [sprints.createdById],
		references: [user.id],
	}),
	sprintTasks: many(sprintTasks),
}));

export const sprintTasksRelations = relations(sprintTasks, ({ one }) => ({
	sprint: one(sprints, {
		fields: [sprintTasks.sprintId],
		references: [sprints.id],
	}),
	task: one(tasks, {
		fields: [sprintTasks.taskId],
		references: [tasks.id],
	}),
	department: one(departments, {
		fields: [sprintTasks.departmentId],
		references: [departments.id],
	}),
	predecessor: one(sprintTasks, {
		fields: [sprintTasks.predecessorId],
		references: [sprintTasks.id],
		relationName: "predecessor",
	}),
	assignedReviewer: one(user, {
		fields: [sprintTasks.assignedReviewerId],
		references: [user.id],
		relationName: "assignedReviewer",
	}),
	finishedBy: one(user, {
		fields: [sprintTasks.finishedById],
		references: [user.id],
		relationName: "finishedBy",
	}),
}));

export const mbTicketsRelations = relations(mbTickets, ({ one, many }) => ({
	author: one(user, {
		fields: [mbTickets.authorId],
		references: [user.id],
		relationName: "mbTicketAuthor",
	}),
	assignee: one(user, {
		fields: [mbTickets.assigneeId],
		references: [user.id],
		relationName: "mbTicketAssignee",
	}),
	project: one(projects, {
		fields: [mbTickets.projectId],
		references: [projects.id],
	}),
	organization: one(organizations, {
		fields: [mbTickets.organizationId],
		references: [organizations.id],
	}),
	issues: many(mbTicketIssues),
	timeEntries: many(timeEntries, { relationName: "timeEntryMbTicket" }),
}));

export const mbTicketIssuesRelations = relations(mbTicketIssues, ({ one }) => ({
	ticket: one(mbTickets, {
		fields: [mbTicketIssues.ticketId],
		references: [mbTickets.id],
	}),
	reporter: one(user, {
		fields: [mbTicketIssues.reporterId],
		references: [user.id],
		relationName: "mbIssueReporter",
	}),
}));
