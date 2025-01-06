import Container from "@/components/Container";
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
   // const { user } = useUser()
    // if (!user) {
    //     return <SignIn />
    //   }
    return <Container><SignIn /></Container>;
}