import CredentialsForm from "../account/credentials-form";
import styles from "./login.module.css";

export default function LoginPage() {
  return <div className={styles.login}><CredentialsForm /></div>;
}
