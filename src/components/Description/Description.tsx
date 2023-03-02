import classes from './Description.module.scss';

import iconSun  from '../../assets/icons/iconSun.svg';
import iconBolt from '../../assets/icons/iconBolt.svg';
import iconWarn from '../../assets/icons/iconWarn.svg';

const Description = () => (
    <div className={classes.container}>
    <div className={classes.content}>
        <div className={classes.cards}>
            <ul>
                <img src={iconSun} className={classes.icon} alt="icon" />
                <h2>How to Play</h2>
                <li>You play as white</li>
                <li>Click and drag a piece to move it</li>
                <li>Wait for ChatGPT to respond</li>
            </ul>
            <ul>
                <img src={iconBolt} className={classes.icon} alt="icon" />
                <h2>Capabilities</h2>
                <li>Can summon pieces out of thin air</li>
                <li>Can put multiple pieces on one square</li>
                <li>Forgets the move sequences after a while</li>
            </ul>
            <ul>
                <img src={iconWarn} className={classes.icon} alt="icon" />
                <h2>Limitations</h2>
                <li>May refuse your moves</li>
                <li>The system might parse bot responses incorrectly</li>
                <li>Limited knowledge of chess events after 2021</li>
            </ul>
        </div>
    </div>
    </div> 
);

export default Description;