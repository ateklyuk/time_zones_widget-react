import { SettingsConfig } from "../config"

export type WidgetStatusResponse = {
    response: 'paid' | 'trial' | 'notPaid' | 'userNotFound'
    paid: boolean
    testPeriod: boolean
    finishUsingDate: string
    startUsingDate: string
}

export type OptionsType = typeof SettingsConfig;
export type OptionT = OptionsType[number];