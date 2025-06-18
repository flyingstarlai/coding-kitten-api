import {CourseDetailResponse, CourseResponse, toCourseDetailResponse, toCourseResponse} from "./model";
import {prisma} from "../../db";
import {slugify} from "../../utils/slugify";

export const listCourses = (): Promise<CourseResponse[]> =>
    prisma.course
        .findMany({ where: { deletedAt: null } })
        .then(cs => cs.map(toCourseResponse))

export const getCourseById = (id: string): Promise<CourseDetailResponse | null> =>
    prisma.course
        .findFirst({
            where: { id, deletedAt: null },
            include: { assignments: { where: { deletedAt: null } } },
        })
        .then(c => c ? toCourseDetailResponse(c) : null)



export const createCourse = (
    data: { title: string; description?: string }
): Promise<CourseResponse> => {
    const slug = slugify(data.title);
    return prisma.course
        .create({ data: { ...data, slug } })
        .then(toCourseResponse)
}

export const updateCourse = (
    id: string,
    data: Partial<{ title: string; description?: string }>
): Promise<CourseResponse> =>
    prisma.course
        .update({ where: { id }, data })
        .then(toCourseResponse)

export const softDeleteCourse = (id: string): Promise<{ id: string }> =>
    prisma.course.update({
        where: { id },
        data: { deletedAt: new Date() },
        select: { id: true },
    })

export const restoreCourse = (id: string): Promise<CourseResponse> =>
    prisma.course
        .update({ where: { id }, data: { deletedAt: null } })
        .then(toCourseResponse)