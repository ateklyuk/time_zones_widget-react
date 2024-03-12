import { ACCOUNT_CF, ACCOUNT_CF_TYPE, MANAGERS } from "../../consts/amo.constants";

const searchEntityName = (field:ACCOUNT_CF_TYPE) => {
    const EntityTranslate = {
        ENTREE_DEALS: "Сделка",
        ENTREE_CONTACTS: "Контакты",
        ENTREE_COMPANY: "Компании",
    } as const;
    type EntityTranslateKeys = keyof typeof EntityTranslate;
    const [reusultFieldEntree] = (Object.keys(EntityTranslate) as EntityTranslateKeys[]).filter((item) => {
        if (field[item] === 1) {
            return item;
        }
    });
    return EntityTranslate[reusultFieldEntree];
};
export const fieldsFromAmo = () => {
    return Object.keys(ACCOUNT_CF)
        .map((element) => {
            let fieldData = ACCOUNT_CF[element];
            let fieldTypeID = fieldData.TYPE_ID;
            if (!searchEntityName(fieldData)) {
                return;
            }
            if (
                fieldTypeID === 9 ||
                fieldTypeID === 11 ||
                fieldTypeID === 1 ||
                fieldTypeID === 13
            ) {
                return {
                    value: fieldData.ID,
                    label: fieldData.NAME + ` (${searchEntityName(fieldData)})`,
                };
            }
        })
        .filter(Boolean);
};

export const fieldsFromAmoFiltered = (defaultValues:string | null) => {
    if (!defaultValues) {
        return []
    }
    return fieldsFromAmo().filter(item => defaultValues.includes(item ? item.value.toString() : 'null'))
};

export const activeManagers = () => {
    return Object.entries(MANAGERS).filter(([_, value]) => {
        if(value.active && (value.free_user === 'N')) {
            return true;
        }
        return false
    })
}