import cn from 'classnames';

import iconError from '../../assets/icons/iconError.svg';
import classes from './ErrorMessage.module.scss';

type ErrorMessageProps = {
    children: any;
    fullWidth?: boolean;
}

const ErrorMessage = ({ children, fullWidth }: ErrorMessageProps) => (
    <div className={cn(classes.container, {
        [classes.fullWidth]: fullWidth,
    })}>
        <img src={iconError} draggable={false} alt="error" />
        <span className={classes.message}>{children}</span>
    </div>
);

export default ErrorMessage;