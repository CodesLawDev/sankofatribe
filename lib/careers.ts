import { client } from './sanity'
import { Career } from './sanity'

export async function getOpenCareers(): Promise<Career[]> {
    const query = `*[_type == "career" && status == "open"] | order(featured desc, postedAt desc) {
        _id,
        _type,
        title,
        slug,
        department,
        employmentType,
        location,
        isRemote,
        salaryRange,
        summary,
        description,
        responsibilities,
        requirements,
        perks,
        applicationUrl,
        applicationEmail,
        status,
        postedAt,
        closingDate,
        featured
    }`

    try {
        const careers = await client.fetch<Career[]>(query, {}, { next: { revalidate: 120 } })
        return careers
    } catch (error) {
        console.error('Error fetching careers:', error)
        return []
    }
}
