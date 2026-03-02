import { z } from "zod";

const optionalTrimmedString = (maxLength: number) =>
	z
		.preprocess(
			(value) => (typeof value === "string" ? value.trim() : value),
			z.union([z.string().max(maxLength), z.undefined(), z.null()]),
		)
		.transform((value) =>
			typeof value === "string" && value ? value : undefined,
		);

const optionalInteger = (min = 0, max = Number.MAX_SAFE_INTEGER) =>
	z.preprocess(
		(value) =>
			value === "" || value === null || value === undefined ? undefined : value,
		z.coerce.number().int().min(min).max(max).optional(),
	);

const idSchema = z.number().int().positive();

export const listQuerySchema = z.object({
	includeArchived: z.boolean().optional().default(false),
});

export const clientCreateSchema = z.object({
	name: z.string().trim().min(2).max(256),
	email: optionalTrimmedString(256),
	phone: optionalTrimmedString(64),
	address: optionalTrimmedString(2000),
	hourlyRate: optionalInteger(0, 1_000_000),
});

export const clientUpdateSchema = z.object({
	id: idSchema,
	name: z.string().trim().min(2).max(256),
	email: optionalTrimmedString(256),
	phone: optionalTrimmedString(64),
	address: optionalTrimmedString(2000),
	hourlyRate: optionalInteger(0, 1_000_000),
});

export const entityArchiveSchema = z.object({
	id: idSchema,
});

export const projectCreateSchema = z.object({
	name: z.string().trim().min(2).max(256),
	color: z
		.string()
		.trim()
		.regex(/^#[0-9A-Fa-f]{6}$/)
		.optional()
		.default("#6366f1"),
	isBillable: z.boolean().default(false),
	hourlyRate: optionalInteger(0, 1_000_000),
	clientId: idSchema.optional(),
});

export const projectUpdateSchema = z.object({
	id: idSchema,
	name: z.string().trim().min(2).max(256),
	color: z
		.string()
		.trim()
		.regex(/^#[0-9A-Fa-f]{6}$/),
	isBillable: z.boolean(),
	hourlyRate: optionalInteger(0, 1_000_000),
	clientId: idSchema.optional(),
});

export const taskStatusSchema = z.enum([
	"not_started",
	"open",
	"on_hold",
	"in_review",
	"complete",
]);

export const taskPrioritySchema = z.enum(["normal", "important", "urgent"]);

export const taskCreateSchema = z.object({
	name: z.string().trim().min(2).max(256),
	description: optionalTrimmedString(4000),
	projectId: idSchema,
	status: taskStatusSchema.default("not_started"),
	priority: taskPrioritySchema.default("normal"),
	estimate: optionalInteger(0, 1_000_000),
	links: optionalTrimmedString(2000),
	completionPercentage: optionalInteger(0, 100),
	allowedOvertime: optionalInteger(0, 1_000_000),
	unlimitedOvertime: z.boolean().default(false),
});

export const taskUpdateSchema = z.object({
	id: idSchema,
	name: z.string().trim().min(2).max(256),
	description: optionalTrimmedString(4000),
	projectId: idSchema,
	status: taskStatusSchema,
	priority: taskPrioritySchema,
	estimate: optionalInteger(0, 1_000_000),
	links: optionalTrimmedString(2000),
	completionPercentage: optionalInteger(0, 100),
	allowedOvertime: optionalInteger(0, 1_000_000),
	unlimitedOvertime: z.boolean(),
});

export const sprintStatusSchema = z.enum(["draft", "active", "completed"]);

export const sprintCreateSchema = z.object({
	name: z.string().trim().min(2).max(256),
	description: optionalTrimmedString(4000),
	projectId: idSchema,
	status: sprintStatusSchema.default("draft"),
});

export const sprintUpdateSchema = z.object({
	id: idSchema,
	name: z.string().trim().min(2).max(256),
	description: optionalTrimmedString(4000),
	projectId: idSchema,
	status: sprintStatusSchema,
});

export type ListQueryInput = z.infer<typeof listQuerySchema>;
export type ClientCreateInput = z.infer<typeof clientCreateSchema>;
export type ClientUpdateInput = z.infer<typeof clientUpdateSchema>;
export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
export type SprintCreateInput = z.infer<typeof sprintCreateSchema>;
export type SprintUpdateInput = z.infer<typeof sprintUpdateSchema>;
