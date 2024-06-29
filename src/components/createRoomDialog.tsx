import { CopyIcon } from '@radix-ui/react-icons'
import { v1 } from 'uuid'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const CreateRoomDialog = ()=> {
    const uuid = v1();

    const baseUrl = 'http://localhost:5173';

    const generatedUrl = `${baseUrl}/room/${uuid}`;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Create link to play</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share this link with a friend to play</DialogTitle>
                    <DialogDescription>
                    Anyone who has this link will be able to play chess with you.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2">
                    <div className="grid flex-1 gap-2">
                        <Label htmlFor="link" className="sr-only">
                        Link
                        </Label>
                        <Input
                            id="link"
                            defaultValue={generatedUrl}
                            readOnly
                            disabled
                        />
                    </div>
                    <Button onClick={()=> {
                        navigator.clipboard.writeText(generatedUrl);
                    }} type="submit" size="sm" className="px-3">
                        <span className="sr-only">Copy</span>
                        <CopyIcon className="h-4 w-4" />
                    </Button>
                </div>
                <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                        Close
                        </Button>
                    </DialogClose>
                    <Button type='button' onClick={()=> window.open(generatedUrl)}>Open</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CreateRoomDialog;
