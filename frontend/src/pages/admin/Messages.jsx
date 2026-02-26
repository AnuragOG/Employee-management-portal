import MessagesPage from '../../components/shared/MessagesPage';
export default function Messages() {
  return <MessagesPage allowedRoles={['employee', 'client']} />;
}
