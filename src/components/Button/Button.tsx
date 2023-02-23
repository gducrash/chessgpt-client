import cn from 'classnames';
import classes from './Button.module.scss';

type ButtonProps = {
    text: string;
    icon?: any;
    onClick?: () => void;
    variation?: 
        | 'primary' 
        | 'secondary'
        | 'info' 
        | 'warn' 
        | 'danger';
    size?: 'normal' | 'small';
    disabled?: boolean;
    loading?: boolean;
    className?: string;
}

const Button = ({
    text,
    icon,
    onClick,
    variation = 'primary',
    size = 'normal',
    disabled = false,
    loading = false,
    className = '',
}: ButtonProps) => (
    <button
        className={cn(classes.button, classes[variation], classes[size], className, {
            [classes.disabled]: disabled || loading,
        })}
        onClick={onClick}
        disabled={disabled || loading}
    >
        { loading ? <div className={classes.loader} /> : (<>
                { icon && <img src={icon} alt="" className={classes.icon} draggable={false} /> }
                { text }
        </>) }
    </button>
);

export default Button;