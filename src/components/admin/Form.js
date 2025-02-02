'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImageUpload } from '@/components/ImageUpload';

export default function Form({
  schema,
  defaultValues,
  onSubmit,
  fields,
  isLoading,
  submitText = 'Save',
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {fields.map((field) => {
        switch (field.type) {
          case 'text':
          case 'email':
          case 'password':
          case 'number':
            return (
              <div key={field.name}>
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  id={field.name}
                  {...register(field.name)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                />
                {errors[field.name] && (
                  <p className="mt-1 text-sm text-red-600">{errors[field.name].message}</p>
                )}
              </div>
            );

          case 'textarea':
            return (
              <div key={field.name}>
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                <textarea
                  id={field.name}
                  {...register(field.name)}
                  rows={field.rows || 3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                />
                {errors[field.name] && (
                  <p className="mt-1 text-sm text-red-600">{errors[field.name].message}</p>
                )}
              </div>
            );

          case 'select':
            return (
              <div key={field.name}>
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                <select
                  id={field.name}
                  {...register(field.name)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                >
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors[field.name] && (
                  <p className="mt-1 text-sm text-red-600">{errors[field.name].message}</p>
                )}
              </div>
            );

          case 'image':
            return (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                <ImageUpload
                  value={watch(field.name)}
                  onUpload={(url) => setValue(field.name, url)}
                />
                {errors[field.name] && (
                  <p className="mt-1 text-sm text-red-600">{errors[field.name].message}</p>
                )}
              </div>
            );

          default:
            return null;
        }
      })}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className={`
            inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white
            ${isLoading ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
          `}
        >
          {isLoading ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              Processing...
            </>
          ) : (
            submitText
          )}
        </button>
      </div>
    </form>
  );
}
