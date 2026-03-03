import { OrgSettingsFormSchema } from "./orgSchemas";

/**
 * Prepares FormData for organization update requests.
 * Handles JSON serialization of social links and appends files if present.
 */
export const prepareOrgUpdateFormData = (values: OrgSettingsFormSchema): FormData => {
    const data = new FormData();
    data.append("name", values.name);
    data.append("region", values.region);
    data.append("tag", values.tag);
    if (values.description) data.append("description", values.description);
    data.append("isHiring", String(values.isHiring));
    data.append("socialLinks", JSON.stringify(values.socialLinks));

    if (values.image instanceof File) {
        data.append("image", values.image);
    }
    if (values.banner instanceof File) {
        data.append("banner", values.banner);
    }

    return data;
};
