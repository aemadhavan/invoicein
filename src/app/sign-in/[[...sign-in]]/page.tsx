import Container from "@/components/Container";
import { SignIn, useUser } from '@clerk/nextjs'

export default function SignInPage() {
   // const { user } = useUser()
    // if (!user) {
    //     return <SignIn />
    //   }
    return <Container><SignIn /></Container>;
}