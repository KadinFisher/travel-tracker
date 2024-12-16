import { useNavigate } from "react-router-dom";
import styles from "./Button.module.css"; // Import the styles from Button.module.css

function BackButton() {
  const navigate = useNavigate();

  return (
    <button className={`${styles.btn} ${styles.back}`} onClick={() => navigate(-1)}>
      ← Back
    </button>
  );
}

export default BackButton;