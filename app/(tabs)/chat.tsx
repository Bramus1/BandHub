import React from 'react';
import {useWorkspace} from '../../src/context';
import {Chat} from '../../src/Chat';
import {Screen,Heading,Empty} from '../../src/ui';
export default function BandChat(){const {band}=useWorkspace();return <Screen><Heading title="The band room." subtitle={band?.name??'Your private conversations live here.'}/>{band?<Chat key={band.id} bandId={band.id}/>:<Empty title="Choose your band" body="Create or join a band from Workspace to start a conversation."/>}</Screen>}
