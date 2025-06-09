import 'styles/page-elements/UserCardTooltip.css';

import { useState } from 'react';
import { FaSeedling, FaLeaf, FaTree, 
  FaApple, FaCrown, FaStar, } from 'react-icons/fa';


const UserCardTooltip = ({ avatar, fullname, username, levelIcon, levelText, levelColor, userRole, children }) => {
  const [visible, setVisible] = useState(false);

    function getLevelIcon(iconName) {
      const icons = {
        FaSeedling: <FaSeedling />,
        FaLeaf: <FaLeaf />,
        FaTree: <FaTree />,
        FaApple: <FaApple />,
        FaCrown: <FaCrown />,
        FaStar: <FaStar />
      };
  
      return icons[iconName] || null;
    }

  return (
    <div
      className="tooltip-wrapper"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className="user-card-tooltip">
          <img src={avatar} alt={`${fullname} avatar`} className="tooltip-user-avatar" />
          <div className="tooltip-user-info">
            <div className="tooltip-fullname">{fullname}</div>
            <div className="tooltip-username">{username}</div>
            {userRole !=="admin" && (
              <div className="tooltip-level" style={{ color: levelColor }}>{getLevelIcon(levelIcon)} {levelText}</div>
            )}          
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCardTooltip;
