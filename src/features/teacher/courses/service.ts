import {CourseDetailResponse, CourseResponse, toCourseDetailResponse, toCourseResponse} from "./model";
import {prisma} from "../../../db";
import {slugify} from "../../../utils/slugify";

export const listCourses = (): Promise<CourseResponse[]> =>
    prisma.course
        .findMany({ where: { deletedAt: null, enable: true } })
        .then(cs => cs.map(toCourseResponse))


export const createCourse = async (
    data: { title: string; description?: string }
): Promise<CourseResponse> => {
    const slug = slugify(data.title);
    const course = await prisma.course
        .create({data: {...data, slug}});
    return toCourseResponse(course);
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