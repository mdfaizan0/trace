import DocumentList from "@/components/DocumentList"

function Documents() {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Documents</h1>
                <p className="text-muted-foreground mt-1 text-sm md:text-base">
                    Browse and manage all your uploaded documents.
                </p>
            </header>
            <DocumentList />
        </div>
    )
}

export default Documents
