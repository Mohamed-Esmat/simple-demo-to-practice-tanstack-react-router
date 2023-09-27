import {
  Link,
  redirect,
  useNavigate,
  useParams,
  useSubmit,
  useNavigation,
} from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { fetchEvent, updateEvent, queryClient } from '../../util/http.js';
// import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EditEvent() {
  const navigate = useNavigate();
  const { state } = useNavigation();
  const submit = useSubmit();
  const params = useParams();
  const id = params.id;

  const { data, isError, error } = useQuery({
    queryKey: ['event', id],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
    staleTime: 10000,
  });

  // const { mutate } = useMutation({
  //   // mutationFn: async (data) => await updateEvent(params.id, data),
  //   mutationFn: updateEvent,
  //   //It will be true to use onSuccess
  //   // onSuccess: () => {
  //   //   queryClient.invalidateQueries({
  //   //     queryKey: ['events'],
  //   //   });
  //   // },

  //   //We will use a method called Optimistic updates, It's a pattern or approach that is easy to implement with tanstack query
  //   //This onMutate function will be executed right when we call mutate, So before this process of mutate is done before you got a response
  //   //And here we will update the data that has been cached
  //   onMutate: async (data) => {
  //     const newEvent = data.event;
  //     await queryClient.cancelQueries({ queryKey: ['events', params.id] });
  //     const previousEvent = queryClient.getQueryData(['events', params.id]);
  //     //use setQueryData() to manaplite the stored data without waiting for a response
  //     queryClient.setQueryData(['events', params.id], newEvent);
  //     return { previousEvent };
  //   },
  //   //Rolling back this optimistic update
  //   onError: (error, data, context) => {
  //     queryClient.setQueryData(['events', params.id], context.previousEvent);
  //   },
  //   onSettled: () => {
  //     queryClient.invalidateQueries(['events', params.id]);
  //   },
  // });

  function handleSubmit(formData) {
    // mutate({ id: params.id, event: formData });
    // navigate('../');
    submit(formData, { method: 'PUT' });
  }

  function handleClose() {
    navigate('../');
  }

  let content;

  // if (isPending) {
  //   content = (
  //     <div className="center">
  //       <LoadingIndicator />
  //     </div>
  //   );
  // }

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="Failed to load event"
          message={
            error.info?.message ||
            'Failed to load event. Please check your inputs and try again.'
          }
        />
        <div className="form-actions">
          <Link to="../" className="button">
            Okay
          </Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        {state === 'submitting' ? (
          <p>Sending data....</p>
        ) : (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Update
            </button>
          </>
        )}
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}

export const loader = ({ params }) => {
  return queryClient.fetchQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });
};

//This action will triggered when a form in this page submitted
export const action = async ({ request, params }) => {
  //formData() is a built in method provided by react router that allows us to get hold of the submitted data
  const formData = await request.formData();
  //this simply transforms this more complex formData() object that is yielded by this formData method to a simple key value pair object in javaScript .
  const updatedEventData = Object.fromEntries(formData);
  await updateEvent({ id: params.id, event: updatedEventData });
  queryClient.invalidateQueries(['events']);
  return redirect('../');
};
