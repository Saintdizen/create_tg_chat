class SettingsStoreMarks {
    static SETTINGS = {
        atlassian: {
            status: "settings.atlassian.status",
            username: "settings.atlassian.username",
            password: "settings.atlassian.password",
            jira: {
                domain: "settings.atlassian.jira.domain",
                create_task: {
                    status: "settings.atlassian.jira.create_task.status",
                    labels: "settings.atlassian.jira.create_task.labels"
                }
            },
            wiki: {
                domain: "settings.atlassian.wiki.domain",
                create_report: {
                    status: "settings.atlassian.wiki.create_report.status",
                }
            }
        },
        google: {
            json_key_path: "settings.google.json_key_path",
            tables: {
                users_groups_id: "settings.google.tables.users_groups_id",
                auth_settings_id: "settings.google.tables.auth_settings_id"
            }
        }
    }
}


exports.SettingsStoreMarks = SettingsStoreMarks