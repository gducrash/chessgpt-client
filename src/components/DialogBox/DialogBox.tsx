import cn from 'classnames';

import Button from '../Button';
import ErrorMessage from '../ErrorMessage';

import classes from './DialogBox.module.scss';

type DialogBoxProps = {
    title: string;
    children?: any;
    buttons?: DialogButton[];
    error?: string;
    canCloseOutside?: boolean;
    onClose?: () => void;
    closing?: boolean;
}

type DialogButton = {
    text?: string;
    icon?: any;
    onClick?: () => void;
    closeDialog?: boolean;
    variation?:
        | 'primary'
        | 'secondary'
        | 'info'
        | 'warn'
        | 'danger';
    size?: 'normal' | 'small' | 'big';
    disabled?: boolean;
    loading?: boolean;
}

const DialogBox = ({
    title,
    children,
    buttons,
    error,
    canCloseOutside,
    onClose,
    closing,
}: DialogBoxProps) => {

    return (
        <div 
            className={cn(classes.container, {
                [classes.closing]: closing,
            })}
            onClick={canCloseOutside ? onClose : undefined}
        >
            <div 
                className={cn(classes.dialog, {
                    [classes.closing]: closing,
                })}
                onClick={e => e.stopPropagation()}
            >
                <div className={classes.header}>
                    <h2>{title}</h2>
                </div>
                <div className={classes.body}>
                    {children}
                </div>
                { buttons && (
                    <div className={classes.buttons}>
                        {buttons.map((button, index) => (
                            <Button
                                key={index}
                                text={button.text ?? ''}
                                icon={button.icon}
                                variation={button.variation}
                                size={button.size}
                                disabled={button.disabled}
                                loading={button.loading}
                                onClick={() => {
                                    if (button.onClick) button.onClick();
                                    if (button.closeDialog) onClose?.();
                                }}
                            />
                        ))}
                    </div>
                ) }
                { error && (
                    <ErrorMessage fullWidth>{ error }</ErrorMessage>
                ) }
            </div>
        </div>
    );

}

export default DialogBox;