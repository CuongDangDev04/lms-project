

export default function NavCoursesFilter() {
    return (
        <div className="flex items-center gap-2 my-4">
            <select className="border rounded-md py-2 px-3 text-sm">
                <option>All</option>
                <option>Active</option>
                <option>Completed</option>
            </select>

            <input
                type="text"
                placeholder="Search"
                className="flex-grow border rounded-md py-2 px-3 text-sm"
            />

            <select className="border rounded-md py-2 px-3 text-sm">
                <option>Sort by course name</option>
                <option>Sort by date</option>
            </select>
        </div>
    )
}