import 'styles/page-elements/NotificationMessage.css';

function NotificationMessage ({textMessage, notificationType }) {
    return (
        <div className={`notification-message ${notificationType}`}>
            {textMessage.split('\n').map((line, index) => (
              <span key={index}>
                {line}
                <br />
              </span>
            ))}
        </div>
    );
}

export default NotificationMessage;
