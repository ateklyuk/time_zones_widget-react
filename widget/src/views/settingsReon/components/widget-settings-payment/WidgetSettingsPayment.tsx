import React from 'react';
import cl from './WidgetSettingsPayment.module.scss'

const WidgetSettingsPayment = (): JSX.Element => {

    return (
        <div className={cl['reon-timezone-payment']}>
            <div className={cl['reon-timezone-payment__container']}>
                <div className={cl['reon-timezone-payment__forward']}>
                    <span>
                    Виджет "Часовые пояса и регионы" FREE от REON доступен <span style={{ fontWeight: 700 }}>совершенно бесплатно</span>, подписка на <a href="https://reon.pro/marketplace" target="_blank">Маркетплейс REON</a> и виджет не требуется!
                    </span>
                </div>
            </div>
        </div>
    )
}

export default WidgetSettingsPayment;