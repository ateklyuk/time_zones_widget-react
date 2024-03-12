import React from 'react';
import WidgetSettingsUser from '../widget-settings-user/WidgetSettingsUser';
import WidgetSettingsPayment from '../widget-settings-payment/WidgetSettingsPayment';
import { SettingsOptionsId } from '../../lib/config';

type WidgetSettingsLayoutProps = {
    selectedOptionId: SettingsOptionsId,
}

const WidgetSettingsLayout = ({ selectedOptionId }: WidgetSettingsLayoutProps): JSX.Element => {
    const SettingsContent = (id: SettingsOptionsId) => {
        switch (id) {
            case SettingsOptionsId.user:
                return <WidgetSettingsUser />
            case SettingsOptionsId.payment:
                return <WidgetSettingsPayment />
        }
    }

    return (
        SettingsContent(selectedOptionId)
    )
};

export default WidgetSettingsLayout;