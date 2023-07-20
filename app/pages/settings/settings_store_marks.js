class SettingsStoreMarks {
    // settings
    settings = {
        // settings.atlassian
        atlassian: {
            status: "settings.atlassian.status",
            username: "settings.atlassian.username",
            password: "settings.atlassian.password",
            // settings.atlassian.jira
            jira: {
                domain: "settings.atlassian.jira.domain",
                create_task: {
                    status: "settings.atlassian.jira.create_task.status",
                    labels: "settings.atlassian.jira.create_task.labels"
                }
            },
            // settings.atlassian.wiki
            wiki: {
                domain: "settings.atlassian.wiki.domain",
                // settings.atlassian.wiki.create_report
                create_report: {
                    status: "settings.atlassian.wiki.create_report.status",
                }
            }
        }
    }
}


exports.SettingsStoreMarks = SettingsStoreMarks